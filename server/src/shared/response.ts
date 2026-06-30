/**
 * Nivarak API — Standard Response Envelope
 *
 * Every API response follows:
 * { success: boolean, data: T | null, meta?: {...}, error: ErrorBody | null }
 */

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: Record<string, unknown>;
  error: ApiError | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { success: true, data, meta, error: null };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    error: null,
  };
}

export function errorResponse(code: string, message: string, details?: ApiError['details']): ApiResponse<null> {
  return { success: false, data: null, error: { code, message, details } };
}
