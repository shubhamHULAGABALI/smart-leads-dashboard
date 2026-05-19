import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadsFilterBar } from '@/components/leads/LeadsFilterBar';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { DeleteLeadDialog } from '@/components/leads/DeleteLeadDialog';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { Pagination } from '@/components/common/Pagination';
import { useLeads, useExportLeads } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import type { Lead, LeadFilters } from '@/types';

const DEFAULT_FILTERS: LeadFilters = {
  status: '',
  source: '',
  search: '',
  sort: 'latest',
  page: 1,
};

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const activeFilters: LeadFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useLeads(activeFilters);
  const exportMutation = useExportLeads();

  // Modal / drawer state
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const hasActiveFilters =
    !!filters.status || !!filters.source || !!searchInput || filters.sort !== 'latest';

  const handleFilterChange = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLead(null);
  };

  const handleExport = () => {
    exportMutation.mutate({
      status: filters.status as LeadFilters['status'],
      source: filters.source as LeadFilters['source'],
      search: debouncedSearch || undefined,
      sort: filters.sort,
    });
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Leads</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {data?.meta ? (
              <>
                <span className="text-[var(--text-secondary)] font-medium">{data.meta.total}</span> total leads
                {isFetching && !isLoading && (
                  <span className="ml-2 text-violet-400 text-xs">Updating…</span>
                )}
              </>
            ) : (
              'Manage your lead pipeline'
            )}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => { setEditingLead(null); setFormOpen(true); }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Lead
        </Button>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <LeadsFilterBar
          filters={filters}
          search={searchInput}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExport={handleExport}
          exporting={exportMutation.isPending}
          hasActiveFilters={hasActiveFilters}
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <LeadsTable
          leads={data?.leads ?? []}
          isLoading={isLoading}
          onView={setViewingLead}
          onEdit={handleEdit}
          onDelete={setDeletingLead}
        />
      </motion.div>

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          meta={data.meta}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      )}

      {/* Modals */}
      <LeadFormModal
        open={formOpen}
        onClose={handleFormClose}
        lead={editingLead}
      />

      <DeleteLeadDialog
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
      />

      <LeadDetailDrawer
        lead={viewingLead}
        onClose={() => setViewingLead(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
