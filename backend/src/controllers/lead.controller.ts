import { Response, NextFunction } from 'express';
import { AuthRequest, LeadQuery } from '../types';
import * as leadService from '../services/lead.service';
import { sendSuccess, sendError } from '../utils/response.util';

// ─── Helpers ───────────────────────────────────────────────────────────────

const parseQuery = (query: AuthRequest['query']): LeadQuery => ({
  status: query.status as LeadQuery['status'],
  source: query.source as LeadQuery['source'],
  search: query.search as string | undefined,
  sort: (query.sort as LeadQuery['sort']) ?? 'latest',
  page: parseInt(query.page as string) || 1,
  limit: Math.min(parseInt(query.limit as string) || 10, 100),
});

// ─── Controllers ───────────────────────────────────────────────────────────

export const getLeads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const { leads, meta } = await leadService.getLeads(parseQuery(req.query), req.user.id, req.user.role);
    sendSuccess(res, leads, 'Leads fetched', 200, meta);
  } catch (err) { next(err); }
};

export const getLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const lead = await leadService.getLeadById(req.params.id, req.user.id, req.user.role);
    if (!lead) { sendError(res, 'Lead not found', 404); return; }
    sendSuccess(res, lead, 'Lead fetched');
  } catch (err) { next(err); }
};

export const createLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const lead = await leadService.createLead({
  ...(req.body as any),
  createdBy: req.user.id,
});
    sendSuccess(res, lead, 'Lead created', 201);
  } catch (err) { next(err); }
};

export const updateLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const lead = await leadService.updateLead(req.params.id, req.body as object, req.user.id, req.user.role);
    if (!lead) { sendError(res, 'Lead not found', 404); return; }
    sendSuccess(res, lead, 'Lead updated');
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Forbidden')) { sendError(res, msg, 403); return; }
    next(err);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const lead = await leadService.deleteLead(req.params.id, req.user.id, req.user.role);
    if (!lead) { sendError(res, 'Lead not found', 404); return; }
    sendSuccess(res, null, 'Lead deleted');
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Forbidden')) { sendError(res, msg, 403); return; }
    next(err);
  }
};

export const exportLeads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }

    const query: Omit<LeadQuery, 'page' | 'limit'> = {
      status: req.query.status as LeadQuery['status'],
      source: req.query.source as LeadQuery['source'],
      search: req.query.search as string | undefined,
      sort: (req.query.sort as LeadQuery['sort']) ?? 'latest',
    };

    const leads = await leadService.getLeadsForExport(query, req.user.id, req.user.role);

    const header = ['Name', 'Email', 'Status', 'Source', 'Created At'].join(',');
    const rows = leads.map((l) =>
      [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.email.replace(/"/g, '""')}"`,
        l.status,
        l.source,
        new Date(l.createdAt).toISOString(),
      ].join(',')
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="smart-leads-export.csv"');
    res.status(200).send([header, ...rows].join('\n'));
  } catch (err) { next(err); }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const stats = await leadService.getLeadStats(req.user.id, req.user.role);
    sendSuccess(res, stats, 'Stats fetched');
  } catch (err) { next(err); }
};

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const days = parseInt(req.query.days as string) || 30;
    const data = await leadService.getAnalytics(req.user.id, req.user.role, days);
    sendSuccess(res, data, 'Analytics fetched');
  } catch (err) { next(err); }
};
