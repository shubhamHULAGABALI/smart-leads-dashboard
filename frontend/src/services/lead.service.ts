import apiClient from './api';
import type {
  ApiResponse,
  Lead,
  LeadStats,
  CreateLeadForm,
  LeadFilters,
  PaginationMeta,
} from '@/types';

export interface LeadsResponse {
  leads: Lead[];
  meta: PaginationMeta;
}

const buildParams = (filters: LeadFilters): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.status)  params.status  = filters.status;
  if (filters.source)  params.source  = filters.source;
  if (filters.search)  params.search  = filters.search;
  if (filters.sort)    params.sort    = filters.sort;
  if (filters.page)    params.page    = String(filters.page);
  return params;
};

export const leadService = {
  getLeads: async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
    const res = await apiClient.get<ApiResponse<Lead[]>>('/leads', {
      params: buildParams(filters),
    });
    return {
      leads: res.data.data ?? [],
      meta: res.data.meta!,
    };
  },

  getLead: async (id: string): Promise<Lead> => {
    const res = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data!;
  },

  createLead: async (data: CreateLeadForm): Promise<Lead> => {
    const res = await apiClient.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data!;
  },

  updateLead: async (id: string, data: Partial<CreateLeadForm>): Promise<Lead> => {
    const res = await apiClient.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data!;
  },

  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },

  getStats: async (): Promise<LeadStats> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>('/leads/stats');
    return res.data.data!;
  },

  exportCSV: async (filters: Omit<LeadFilters, 'page'>): Promise<void> => {
    const res = await apiClient.get('/leads/export', {
      params: buildParams(filters),
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-leads-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export interface AnalyticsData {
  timeline: Array<{ date: string; leads: number; qualified: number }>;
  byStatus: Array<{ status: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  conversionRate: number;
  avgPerDay: number;
}

// append to leadService object by reassigning
Object.assign(leadService, {
  getAnalytics: async (days = 30): Promise<AnalyticsData> => {
    const res = await apiClient.get<ApiResponse<AnalyticsData>>('/leads/analytics', { params: { days } });
    return res.data.data!;
  },
});

export const analyticsService = {
  getAnalytics: async (days = 30): Promise<AnalyticsData> => {
    const res = await apiClient.get<ApiResponse<AnalyticsData>>('/leads/analytics', { params: { days } });
    return res.data.data!;
  },
};
