import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LeadStatus, LeadSource } from '@/types';

// ─── Tailwind class merge ─────────────────────────────────────────────────
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

// ─── Date formatting ──────────────────────────────────────────────────────
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));

export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};

// ─── Status meta ──────────────────────────────────────────────────────────
export const STATUS_META: Record<
  LeadStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  new:       { label: 'New',       color: 'text-blue-400',   bg: 'bg-blue-400/10',   dot: 'bg-blue-400' },
  contacted: { label: 'Contacted', color: 'text-amber-400',  bg: 'bg-amber-400/10',  dot: 'bg-amber-400' },
  qualified: { label: 'Qualified', color: 'text-emerald-400',bg: 'bg-emerald-400/10',dot: 'bg-emerald-400' },
  lost:      { label: 'Lost',      color: 'text-red-400',    bg: 'bg-red-400/10',    dot: 'bg-red-400' },
};

// ─── Source meta ──────────────────────────────────────────────────────────
export const SOURCE_META: Record<LeadSource, { label: string }> = {
  website:   { label: 'Website' },
  instagram: { label: 'Instagram' },
  referral:  { label: 'Referral' },
};

// ─── Error extraction ─────────────────────────────────────────────────────
export const extractErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data as { message?: string };
    return data?.message ?? 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
