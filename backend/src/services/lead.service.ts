import mongoose, { FilterQuery } from 'mongoose';
import { Lead, ILeadDocument } from '../models/lead.model';
import { LeadQuery, LeadStatus, LeadSource, UserRole, PaginationMeta } from '../types';

// ─── Interfaces ────────────────────────────────────────────────────────────

interface CreateLeadInput {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
  createdBy: string;
}

interface UpdateLeadInput {
  name?: string;
  email?: string;
  status?: LeadStatus;
  source?: LeadSource;
}

export interface LeadsResult {
  leads: ILeadDocument[];
  meta: PaginationMeta;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const paginate = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const buildFilter = (
  query: Omit<LeadQuery, 'sort' | 'page' | 'limit'>,
  _userId: string,
  _role: UserRole
): FilterQuery<ILeadDocument> => {
  const filter: FilterQuery<ILeadDocument> = {};

  // Sales users see ALL leads; the createdBy restriction only applies to mutations
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  return filter;
};

// ─── Service Functions ─────────────────────────────────────────────────────

export const getLeads = async (
  query: LeadQuery,
  userId: string,
  role: UserRole
): Promise<LeadsResult> => {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(query.limit ?? 10, 100);
  const skip = (page - 1) * limit;
  const sort = query.sort === 'oldest' ? 1 : -1;

  const filter = buildFilter(query, userId, role);

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    leads: leads as unknown as ILeadDocument[],
    meta: paginate(total, page, limit),
  };
};

export const getLeadById = async (
  id: string,
  _userId: string,
  _role: UserRole
): Promise<ILeadDocument | null> => {
  if (!mongoose.isValidObjectId(id)) return null;

  const lead = await Lead.findById(id).populate('createdBy', 'name email role');
  if (!lead) return null;

  // Sales users can VIEW any lead — ownership only restricts edit/delete
  return lead;
};

export const createLead = async (input: CreateLeadInput): Promise<ILeadDocument> =>
  Lead.create(input);

export const updateLead = async (
  id: string,
  input: UpdateLeadInput,
  _userId: string,
  _role: UserRole
): Promise<ILeadDocument | null> => {
  if (!mongoose.isValidObjectId(id)) return null;

  const lead = await Lead.findById(id);
  if (!lead) return null;

  if (_role === 'sales' && lead.createdBy.toString() !== _userId) {
    throw new Error('Forbidden: You can only update your own leads');
  }

  return Lead.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
};

export const deleteLead = async (
  id: string,
  _userId: string,
  _role: UserRole
): Promise<ILeadDocument | null> => {
  if (!mongoose.isValidObjectId(id)) return null;

  const lead = await Lead.findById(id);
  if (!lead) return null;

  if (_role === 'sales' && lead.createdBy.toString() !== _userId) {
    throw new Error('Forbidden: You can only delete your own leads');
  }

  return Lead.findByIdAndDelete(id);
};

export const getLeadsForExport = async (
  query: Omit<LeadQuery, 'page' | 'limit'>,
  _userId: string,
  _role: UserRole
): Promise<ILeadDocument[]> => {
  const sort = query.sort === 'oldest' ? 1 : -1;
  const filter = buildFilter(query, _userId, _role); // no ownership restriction on read

  return Lead.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: sort })
    .lean() as unknown as ILeadDocument[];
};

export const getLeadStats = async (
  _userId: string,
  _role: UserRole
): Promise<Record<string, number>> => {
  // Both roles see global stats (ownership only matters for mutations)
  const baseFilter: FilterQuery<ILeadDocument> = {};

  const stats = await Lead.aggregate<{ _id: string; count: number }>([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const result: Record<string, number> = { total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 };

  for (const stat of stats) {
    if (stat._id in result) {
      result[stat._id] = stat.count;
    }
    result.total += stat.count;
  }

  return result;
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsData {
  timeline: Array<{ date: string; leads: number; qualified: number }>;
  byStatus: Array<{ status: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  conversionRate: number;
  avgPerDay: number;
}

export const getAnalytics = async (
  _userId: string,
  _role: UserRole,
  days = 30
): Promise<AnalyticsData> => {
  // Sales users see global analytics — ownership only restricts mutations
  const baseFilter: FilterQuery<ILeadDocument> = {};

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Timeline: leads per day for last `days` days
  const timelineRaw = await Lead.aggregate<{ _id: string; leads: number; qualified: number }>([
    { $match: { ...baseFilter, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        leads:     { $sum: 1 },
        qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill every day in range
  const timeline: Array<{ date: string; leads: number; qualified: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = timelineRaw.find((r) => r._id === key);
    timeline.push({ date: key, leads: found?.leads ?? 0, qualified: found?.qualified ?? 0 });
  }

  // By status
  const byStatusRaw = await Lead.aggregate<{ _id: string; count: number }>([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const byStatus = byStatusRaw.map((r) => ({ status: r._id, count: r.count }));

  // By source
  const bySourceRaw = await Lead.aggregate<{ _id: string; count: number }>([
    { $match: baseFilter },
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const bySource = bySourceRaw.map((r) => ({ source: r._id, count: r.count }));

  // Conversion rate (qualified / total * 100)
  const total     = byStatus.reduce((s, r) => s + r.count, 0);
  const qualified = byStatus.find((r) => r.status === 'qualified')?.count ?? 0;
  const conversionRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

  // Avg leads per day (last 30 days)
  const timelineTotal = timeline.reduce((s, r) => s + r.leads, 0);
  const avgPerDay = parseFloat((timelineTotal / days).toFixed(1));

  return { timeline, byStatus, bySource, conversionRate, avgPerDay };
};
