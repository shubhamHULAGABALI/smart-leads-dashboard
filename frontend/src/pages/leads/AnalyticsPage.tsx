import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  PieChart, Pie, Tooltip, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Target, Users, Activity, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useLeads';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils';

// ─── Colour maps ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new:       '#3B82F6',
  contacted: '#F59E0B',
  qualified: '#10B981',
  lost:      '#EF4444',
};

const SOURCE_COLORS: Record<string, string> = {
  website:   '#8B5CF6',
  instagram: '#EC4899',
  referral:  '#14B8A6',
};

// ─── Chart tooltip ────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ name: string; value: number; color: string }>;
}

function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] px-3.5 py-2.5 shadow-2xl text-xs">
      {label && <p className="mb-2 font-semibold text-[var(--text-secondary)]">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[var(--text-muted)] capitalize">{p.name}</span>
          <span className="ml-auto font-semibold text-[var(--text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, delay = 0, className }: {
  title: string; subtitle?: string; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5', className)}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, accent, trend, delay }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; trend?: 'up' | 'down' | null; delay: number;
}) {
  const accents: Record<string, { icon: string; bg: string; border: string }> = {
    violet:  { icon: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    blue:    { icon: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    amber:   { icon: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  };
  const c = accents[accent] ?? accents.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 hover:border-[var(--border-light)] transition-colors"
    >
      <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl border', c.bg, c.border, c.icon)}>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</span>
        {trend === 'up'   && <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400"><ArrowUpRight className="h-3.5 w-3.5" />Growing</span>}
        {trend === 'down' && <span className="flex items-center gap-0.5 text-xs font-medium text-red-400"><ArrowDownRight className="h-3.5 w-3.5" />Declining</span>}
      </div>
      <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>
    </motion.div>
  );
}

// ─── Analytics page ───────────────────────────────────────────────────────

const RANGES = [
  { label: '7 days',  value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAnalytics(days);

  // Build timeline with readable labels
  const timelineData = (data?.timeline ?? []).map((d) => {
    const dateObj = new Date(d.date);
    const label = days <= 7
      ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { ...d, label };
  });

  // Only render every Nth tick to avoid crowding X-axis
  const everyN = days <= 7 ? 1 : days <= 30 ? 5 : 14;

  const totalLeads = data?.byStatus.reduce((s, r) => s + r.count, 0) ?? 0;

  // Derive trend signal from second half of timeline vs first half
  const mid = Math.floor(timelineData.length / 2);
  const firstHalf  = timelineData.slice(0, mid).reduce((s, d) => s + d.leads, 0);
  const secondHalf = timelineData.slice(mid).reduce((s, d) => s + d.leads, 0);
  const trend: 'up' | 'down' | null = firstHalf === 0 ? null : secondHalf > firstHalf ? 'up' : 'down';

  const metrics = [
    {
      label: 'Total Leads',
      value: totalLeads,
      sub: `Over last ${days} days`,
      icon: <Users className="h-4 w-4" />,
      accent: 'violet',
      trend,
    },
    {
      label: 'Daily Average',
      value: data?.avgPerDay ?? 0,
      sub: 'Leads created per day',
      icon: <Activity className="h-4 w-4" />,
      accent: 'blue',
      trend: null as 'up' | 'down' | null,
    },
    {
      label: 'Conversion Rate',
      value: `${data?.conversionRate ?? 0}%`,
      sub: 'New to qualified',
      icon: <TrendingUp className="h-4 w-4" />,
      accent: 'emerald',
      trend: null as 'up' | 'down' | null,
    },
    {
      label: 'Qualified Leads',
      value: data?.byStatus.find((s) => s.status === 'qualified')?.count ?? 0,
      sub: 'Ready to close',
      icon: <Target className="h-4 w-4" />,
      accent: 'amber',
      trend: null as 'up' | 'down' | null,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Pipeline trends and performance metrics</p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
          <CalendarDays className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                days === r.value
                  ? 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          : metrics.map((m, i) => <MetricCard key={m.label} {...m} delay={i * 0.06} />)
        }
      </div>

      {/* Lead volume area chart */}
      <ChartCard
        title="Lead Volume Over Time"
        subtitle={`New leads and qualified leads — last ${days} days`}
        delay={0.2}
      >
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-lg" />
        ) : timelineData.every((d) => d.leads === 0) ? (
          <div className="flex h-56 items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">No lead data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradQualified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={everyN - 1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="leads"     name="Leads"     stroke="#7C3AED" strokeWidth={1.5} fill="url(#gradLeads)"     dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="qualified" name="Qualified" stroke="#10B981" strokeWidth={1.5} fill="url(#gradQualified)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {!isLoading && (
          <div className="mt-3 flex items-center gap-5 border-t border-[var(--border)] pt-3">
            {[
              { label: 'Total leads',     color: '#7C3AED' },
              { label: 'Qualified leads', color: '#10B981' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                <span className="text-xs text-[var(--text-muted)]">{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* Bar + Pie side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Leads by status bar chart */}
        <ChartCard title="Leads by Status" subtitle="Distribution across pipeline stages" delay={0.3}>
          {isLoading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : data?.byStatus.length === 0 ? (
            <div className="flex h-52 items-center justify-center">
              <p className="text-sm text-[var(--text-muted)]">No data available</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data?.byStatus ?? []}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                  barCategoryGap="35%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {(data?.byStatus ?? []).map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? '#7C3AED'}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Inline row totals */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[var(--border)] pt-3">
                {(data?.byStatus ?? []).map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
                      <span className="text-xs capitalize text-[var(--text-muted)]">{s.status}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Leads by source pie chart */}
        <ChartCard title="Leads by Source" subtitle="Where your leads are coming from" delay={0.36}>
          {isLoading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : data?.bySource.length === 0 ? (
            <div className="flex h-52 items-center justify-center">
              <p className="text-sm text-[var(--text-muted)]">No data available</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={data?.bySource ?? []}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {(data?.bySource ?? []).map((entry) => (
                        <Cell
                          key={entry.source}
                          fill={SOURCE_COLORS[entry.source] ?? '#7C3AED'}
                          fillOpacity={0.9}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0];
                        return (
                          <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-2 shadow-xl text-xs">
                            <p className="capitalize font-semibold text-[var(--text-primary)]">{d.name}</p>
                            <p className="text-[var(--text-muted)]">{d.value} leads</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Source breakdown */}
                <div className="flex-1 space-y-2.5">
                  {(data?.bySource ?? []).map((s) => {
                    const pct = totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0;
                    const color = SOURCE_COLORS[s.source] ?? '#7C3AED';
                    return (
                      <div key={s.source} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                            <span className="text-xs capitalize text-[var(--text-secondary)]">{s.source}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{s.count}</span>
                            <span className="text-[10px] text-[var(--text-muted)] w-7 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Daily activity heatmap row — bar chart of each day's leads */}
      <ChartCard
        title="Daily Activity"
        subtitle={`Lead volume each day — last ${days} days`}
        delay={0.42}
      >
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={timelineData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval={everyN - 1}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={20}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="leads" name="Leads" fill="#7C3AED" fillOpacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
