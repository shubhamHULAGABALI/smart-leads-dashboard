import { Search, SlidersHorizontal, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select';
import type { LeadFilters, LeadStatus, LeadSource, SortOrder } from '@/types';

interface LeadsFilterBarProps {
  filters: LeadFilters;
  search: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string) => void;
  onReset: () => void;
  onExport: () => void;
  exporting: boolean;
  hasActiveFilters: boolean;
}

export function LeadsFilterBar({
  filters,
  search,
  onSearchChange,
  onFilterChange,
  onReset,
  onExport,
  exporting,
  hasActiveFilters,
}: LeadsFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px] max-w-xs">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          rightElement={
            search ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
        />
      </div>

      {/* Status filter */}
      <div className="w-36">
        <Select
          value={filters.status ?? ''}
          onValueChange={(v) => onFilterChange('status', v === 'all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source filter */}
      <div className="w-36">
        <Select
          value={filters.source ?? ''}
          onValueChange={(v) => onFilterChange('source', v === 'all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="w-32">
        <Select
          value={filters.sort ?? 'latest'}
          onValueChange={(v) => onFilterChange('sort', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onExport}
        loading={exporting}
        className="gap-1.5 shrink-0"
      >
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
