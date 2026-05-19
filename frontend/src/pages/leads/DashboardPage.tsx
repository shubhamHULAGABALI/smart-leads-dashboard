import { motion } from 'framer-motion';
import { Users, Target, PhoneCall, XCircle, Plus, ArrowRight, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/common/StatCard';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useLeadStats, useLeads } from '@/hooks/useLeads';
import { useAuthStore } from '@/store/auth.store';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRelative, SOURCE_META } from '@/utils';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ sort: 'latest', page: 1 });
  const { user } = useAuthStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { title: 'Total Leads',  value: stats?.total ?? 0,     description: 'All pipeline leads', icon: <Users className="h-4 w-4" />,     accent: 'violet' },
    { title: 'Qualified',    value: stats?.qualified ?? 0,  description: 'Ready to close',     icon: <Target className="h-4 w-4" />,    accent: 'emerald' },
    { title: 'Contacted',    value: stats?.contacted ?? 0,  description: 'In conversation',    icon: <PhoneCall className="h-4 w-4" />, accent: 'amber' },
    { title: 'Lost',         value: stats?.lost ?? 0,       description: 'Needs review',       icon: <XCircle className="h-4 w-4" />,   accent: 'red' },
  ];

  const recentLeads = leadsData?.leads.slice(0, 5) ?? [];

  return (
    <div className="p-6 space-y-8 max-w-screen-xl">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{greeting}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/dashboard/leads">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Lead
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Overview</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((c, i) => <StatCard key={c.title} {...c} delay={i * 0.07} />)
          }
        </div>
      </section>

      {/* Status bar + Recent leads side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Status breakdown */}
        {!statsLoading && stats && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.28 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Pipeline Health</p>
              <Activity className="h-4 w-4 text-[var(--text-muted)]" />
            </div>

            {/* Stacked progress bar */}
            <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
              {[
                { key: 'new',       color: 'bg-blue-400' },
                { key: 'contacted', color: 'bg-amber-400' },
                { key: 'qualified', color: 'bg-emerald-400' },
                { key: 'lost',      color: 'bg-red-400' },
              ].map(({ key, color }) => {
                const val = stats[key as keyof typeof stats] as number;
                const pct = (val / stats.total) * 100;
                return pct > 0 ? (
                  <div key={key} className={`${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                ) : null;
              })}
            </div>

            {/* Legend rows */}
            <div className="space-y-2">
              {[
                { label: 'New',       key: 'new',       color: 'bg-blue-400',    text: 'text-blue-400' },
                { label: 'Contacted', key: 'contacted', color: 'bg-amber-400',   text: 'text-amber-400' },
                { label: 'Qualified', key: 'qualified', color: 'bg-emerald-400', text: 'text-emerald-400' },
                { label: 'Lost',      key: 'lost',      color: 'bg-red-400',     text: 'text-red-400' },
              ].map(({ label, key, color, text }) => {
                const val = stats[key as keyof typeof stats] as number;
                const pct = Math.round((val / stats.total) * 100);
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
                    <span className="flex-1 text-sm text-[var(--text-secondary)]">{label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${text}`}>{val}</span>
                    <span className="w-8 text-right text-xs text-[var(--text-muted)]">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Conversion rate */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Conversion rate
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Recent leads table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Recent Leads</p>
            <Link to="/dashboard/leads" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {leadsLoading ? (
            <div className="divide-y divide-[var(--border)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-7 w-7 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3 w-28 rounded" />
                      <div className="skeleton h-2.5 w-36 rounded" />
                    </div>
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-sm font-medium text-[var(--text-primary)]">No leads yet</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Create your first lead to get started</p>
              <Link to="/dashboard/leads" className="mt-4">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Lead
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentLeads.map((lead, i) => (
                <motion.div
                  key={lead._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-violet-400 text-xs font-bold">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{lead.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {SOURCE_META[lead.source].label} &middot; {formatRelative(lead.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { to: '/dashboard/leads',    title: 'Manage Leads',  desc: 'View, filter, search and export your pipeline' },
          { to: '/dashboard/analytics',title: 'Analytics',     desc: 'Charts, trends and pipeline performance metrics' },
        ].map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
          >
            <Link
              to={item.to}
              className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 hover:border-[var(--border-light)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
