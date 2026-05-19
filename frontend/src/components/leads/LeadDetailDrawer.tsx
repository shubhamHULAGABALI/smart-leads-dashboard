import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Clock, Globe, Tag, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatRelative, SOURCE_META } from '@/utils';
import type { Lead } from '@/types';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export function LeadDetailDrawer({ lead, onClose, onEdit }: LeadDetailDrawerProps) {
  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-[var(--border-light)] bg-[var(--surface-1)] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Lead Details</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Added {formatRelative(lead.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-400 text-lg font-bold">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{lead.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{lead.email}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <span className="text-sm text-[var(--text-secondary)]">Current status</span>
                <StatusBadge status={lead.status} />
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {[
                  {
                    icon: <Mail className="h-4 w-4" />,
                    label: 'Email',
                    value: lead.email,
                  },
                  {
                    icon: <Globe className="h-4 w-4" />,
                    label: 'Source',
                    value: SOURCE_META[lead.source].label,
                  },
                  {
                    icon: <Tag className="h-4 w-4" />,
                    label: 'Status',
                    value: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
                  },
                  {
                    icon: <User className="h-4 w-4" />,
                    label: 'Created by',
                    value: lead.createdBy?.name ?? 'Unknown',
                  },
                  {
                    icon: <Clock className="h-4 w-4" />,
                    label: 'Created at',
                    value: formatDate(lead.createdAt),
                  },
                  {
                    icon: <Clock className="h-4 w-4" />,
                    label: 'Last updated',
                    value: formatDate(lead.updatedAt),
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <span className="text-[var(--text-muted)]">{icon}</span>
                    <span className="text-sm text-[var(--text-muted)] w-24 shrink-0">{label}</span>
                    <span className="text-sm text-[var(--text-primary)] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] px-6 py-4">
              <Button className="w-full" onClick={() => { onEdit(lead); onClose(); }}>
                Edit Lead
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
