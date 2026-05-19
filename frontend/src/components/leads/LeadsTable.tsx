import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { StatusBadge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate, SOURCE_META, cn } from '@/utils';
import type { Lead } from '@/types';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const SOURCE_ICON: Record<string, string> = {
  website: '🌐',
  instagram: '📷',
  referral: '👥',
};

export function LeadsTable({ leads, isLoading, onView, onEdit, onDelete }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              {['Name', 'Email', 'Status', 'Source', 'Created', ''].map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]',
                    h === '' && 'text-right'
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No leads match your filters"
                    description="Try adjusting your search or filter criteria."
                  />
                </td>
              </tr>
            ) : (
              leads.map((lead, i) => (
                <motion.tr
                  key={lead._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="lead-row border-b border-[var(--border)] last:border-0 cursor-pointer"
                  onClick={() => onView(lead)}
                >
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-violet-400 text-xs font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                        {lead.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-[var(--text-secondary)] truncate max-w-[180px]">
                    {lead.email}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs">
                      <span>{SOURCE_ICON[lead.source]}</span>
                      {SOURCE_META[lead.source].label}
                    </span>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Lead actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="end"
                          sideOffset={4}
                          className={cn(
                            'z-50 min-w-[140px] rounded-xl border border-[var(--border-light)]',
                            'bg-[var(--surface-2)] p-1 shadow-xl',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
                          )}
                        >
                          {[
                            { icon: <Eye className="h-3.5 w-3.5" />, label: 'View', action: () => onView(lead) },
                            { icon: <Pencil className="h-3.5 w-3.5" />, label: 'Edit', action: () => onEdit(lead) },
                          ].map(({ icon, label, action }) => (
                            <DropdownMenu.Item
                              key={label}
                              onSelect={action}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer',
                                'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]',
                                'transition-colors focus:outline-none focus:bg-[var(--surface-3)]'
                              )}
                            >
                              {icon}
                              {label}
                            </DropdownMenu.Item>
                          ))}
                          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
                          <DropdownMenu.Item
                            onSelect={() => onDelete(lead)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer',
                              'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                              'transition-colors focus:outline-none focus:bg-red-500/10'
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
