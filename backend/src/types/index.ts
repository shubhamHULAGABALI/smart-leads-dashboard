import { Request } from 'express';

// ─── Enums / Literals ──────────────────────────────────────────────────────

export type UserRole = 'admin' | 'sales';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral';
export type SortOrder = 'latest' | 'oldest';

// ─── Domain Shapes ─────────────────────────────────────────────────────────

export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Request Extensions ────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// ─── JWT ───────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── API Response ──────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

// ─── Lead Queries ──────────────────────────────────────────────────────────

export interface LeadQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: SortOrder;
  page?: number;
  limit?: number;
}
