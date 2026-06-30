/**
 * Shared Errors — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  RateLimitError,
} from '../../shared/errors.js';

describe('Error Classes', () => {
  it('AppError has correct defaults', () => {
    const err = new AppError(500, 'TEST', 'test message');
    expect(err.message).toBe('test message');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('TEST');
    expect(err).toBeInstanceOf(Error);
  });

  it('ValidationError → 400 with VALIDATION_ERROR code', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('bad input');
  });

  it('ValidationError accepts field details', () => {
    const details = [{ field: 'name', message: 'required' }];
    const err = new ValidationError('bad input', details);
    expect(err.details).toEqual(details);
  });

  it('AuthenticationError → 401 with AUTHENTICATION_ERROR code', () => {
    const err = new AuthenticationError('not authenticated');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_ERROR');
  });

  it('AuthorizationError → 403 with AUTHORIZATION_ERROR code', () => {
    const err = new AuthorizationError('forbidden');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('AUTHORIZATION_ERROR');
  });

  it('NotFoundError → 404 with NOT_FOUND code', () => {
    const err = new NotFoundError('Patient', 'abc-123');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('Patient');
    expect(err.message).toContain('abc-123');
  });

  it('ConflictError → 409 with CONFLICT code', () => {
    const err = new ConflictError('already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('BusinessRuleError → 422 with BUSINESS_RULE_VIOLATION code', () => {
    const err = new BusinessRuleError('cannot complete');
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('BUSINESS_RULE_VIOLATION');
  });

  it('RateLimitError → 429 with RATE_LIMIT_EXCEEDED code', () => {
    const err = new RateLimitError('too many requests');
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('all errors are instances of AppError', () => {
    expect(new ValidationError('x')).toBeInstanceOf(AppError);
    expect(new AuthenticationError('x')).toBeInstanceOf(AppError);
    expect(new AuthorizationError('x')).toBeInstanceOf(AppError);
    expect(new NotFoundError('X', 'y')).toBeInstanceOf(AppError);
    expect(new ConflictError('x')).toBeInstanceOf(AppError);
    expect(new BusinessRuleError('x')).toBeInstanceOf(AppError);
    expect(new RateLimitError('x')).toBeInstanceOf(AppError);
  });
});
