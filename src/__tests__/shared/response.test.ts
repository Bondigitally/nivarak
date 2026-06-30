/**
 * Shared Response Helpers — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { successResponse, paginatedResponse, errorResponse } from '../../shared/response.js';

describe('Response Helpers', () => {
  describe('successResponse', () => {
    it('wraps data with success: true', () => {
      const result = successResponse({ id: '123', name: 'test' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '123', name: 'test' });
    });

    it('handles null data', () => {
      const result = successResponse(null);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('handles array data', () => {
      const result = successResponse([1, 2, 3]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });

  describe('paginatedResponse', () => {
    it('includes pagination metadata', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = paginatedResponse(data, 1, 20, 50);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.meta!.page).toBe(1);
      expect(result.meta!.limit).toBe(20);
      expect(result.meta!.total).toBe(50);
      expect(result.meta!.totalPages).toBe(3); // ceil(50/20) = 3
    });

    it('calculates totalPages correctly for exact division', () => {
      const result = paginatedResponse([], 1, 20, 40);
      expect(result.meta!.totalPages).toBe(2);
    });

    it('calculates totalPages = 1 when total < limit', () => {
      const result = paginatedResponse([], 1, 20, 5);
      expect(result.meta!.totalPages).toBe(1);
    });

    it('handles empty data', () => {
      const result = paginatedResponse([], 1, 20, 0);
      expect(result.data).toEqual([]);
      expect(result.meta!.total).toBe(0);
      expect(result.meta!.totalPages).toBe(0);
    });
  });

  describe('errorResponse', () => {
    it('wraps error with success: false', () => {
      const result = errorResponse('TEST_CODE', 'Something went wrong');
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error!.code).toBe('TEST_CODE');
      expect(result.error!.message).toBe('Something went wrong');
    });

    it('includes optional details', () => {
      const details = [{ field: 'email', message: 'invalid' }];
      const result = errorResponse('VALIDATION', 'Bad request', details);
      expect(result.error!.details).toEqual(details);
    });
  });
});
