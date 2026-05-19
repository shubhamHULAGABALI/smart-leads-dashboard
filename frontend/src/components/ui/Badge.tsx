import * as React from 'react';
import { cn } from '@/utils';
import { STATUS_META } from '@/utils';
import type { LeadStatus } from '@/types';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.bg,
        meta.color,
        className
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full shrink-0', meta.dot, {
          'badge-dot-new': status === 'new',
        })}
      />
      {meta.label}
    </span>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        {
          'bg-violet-600/15 text-violet-400 border border-violet-600/20': variant === 'default',
          'bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border)]': variant === 'secondary',
          'border border-[var(--border-light)] text-[var(--text-muted)]': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
