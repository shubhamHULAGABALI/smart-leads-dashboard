import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  accent?: string;
  delay?: number;
}

export function StatCard({ title, value, description, icon, accent = 'violet', delay = 0 }: StatCardProps) {
  const accentMap: Record<string, { icon: string; border: string; bg: string }> = {
    violet:  { icon: 'text-violet-400',  border: 'border-violet-500/20',  bg: 'bg-violet-500/10' },
    blue:    { icon: 'text-blue-400',    border: 'border-blue-500/20',    bg: 'bg-blue-500/10' },
    amber:   { icon: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/10' },
    emerald: { icon: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
    red:     { icon: 'text-red-400',     border: 'border-red-500/20',     bg: 'bg-red-500/10' },
  };
  const colors = accentMap[accent] ?? accentMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group relative rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5',
        'hover:border-[var(--border-light)] transition-colors duration-200'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'mb-3 flex h-9 w-9 items-center justify-center rounded-xl border',
        colors.bg, colors.border, colors.icon
      )}>
        {icon}
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </span>
      </div>

      {/* Title */}
      <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <TrendingUp className="h-3 w-3" />
          {description}
        </p>
      )}
    </motion.div>
  );
}
