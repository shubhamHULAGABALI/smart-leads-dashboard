import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton rounded-md',
        className
      )}
    />
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--border)]">
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-44" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-7 w-16 ml-auto" /></td>
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
