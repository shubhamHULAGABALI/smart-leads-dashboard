import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { leadService, analyticsService } from '@/services/lead.service';
import { useNotificationStore } from '@/store/notification.store';
import { extractErrorMessage } from '@/utils';
import type { CreateLeadForm, LeadFilters } from '@/types';

export const LEADS_KEY     = 'leads';
export const STATS_KEY     = 'lead-stats';
export const ANALYTICS_KEY = 'lead-analytics';

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadService.getLeads(filters),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: leadService.getStats,
    staleTime: 60_000,
  });
}

export function useAnalytics(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, days],
    queryFn: () => analyticsService.getAnalytics(days),
    staleTime: 60_000,
  });
}

export function useCreateLead() {
  const qc   = useQueryClient();
  const addN = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: leadService.createLead,
    onSuccess: (lead) => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      toast.success('Lead created');
      addN({ type: 'lead_created', title: 'New lead added', body: `${lead.name} was added via ${lead.source}.` });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateLead() {
  const qc   = useQueryClient();
  const addN = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadForm> }) =>
      leadService.updateLead(id, data),
    onSuccess: (lead) => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      toast.success('Lead updated');
      if (lead.status === 'qualified') {
        addN({ type: 'lead_qualified', title: 'Lead qualified', body: `${lead.name} is now qualified.` });
      } else if (lead.status === 'lost') {
        addN({ type: 'lead_lost', title: 'Lead marked lost', body: `${lead.name} has been marked as lost.` });
      } else {
        addN({ type: 'lead_updated', title: 'Lead updated', body: `${lead.name}'s details were updated.` });
      }
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadService.deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      toast.success('Lead deleted');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useExportLeads() {
  return useMutation({
    mutationFn: (filters: Omit<LeadFilters, 'page'>) => leadService.exportCSV(filters),
    onSuccess: () => toast.success('CSV exported'),
    onError:   (err) => toast.error(extractErrorMessage(err)),
  });
}
