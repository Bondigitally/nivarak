/**
 * Auth Validation Schema — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { inviteSchema } from '../../modules/auth/auth.schema.js';

describe('Auth Schemas', () => {
  describe('inviteSchema', () => {
    it('accepts valid invite with role', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'Priya Sharma',
        role: 'nurse',
      };
      expect(inviteSchema.safeParse(data).success).toBe(true);
    });

    it('accepts all valid roles', () => {
      for (const role of ['patient', 'caregiver', 'nurse', 'doctor', 'coordinator', 'admin']) {
        const data = { phone: '+919876543210', fullName: 'Test User', role };
        expect(inviteSchema.safeParse(data).success).toBe(true);
      }
    });

    it('rejects invalid role', () => {
      const data = { phone: '+919876543210', fullName: 'Test User', role: 'superadmin' };
      expect(inviteSchema.safeParse(data).success).toBe(false);
    });

    it('rejects missing role', () => {
      const data = { phone: '+919876543210', fullName: 'Test User' };
      expect(inviteSchema.safeParse(data).success).toBe(false);
    });

    it('accepts valid Indian phone number', () => {
      expect(
        inviteSchema.safeParse({
          phone: '+919876543210',
          fullName: 'Test User',
          role: 'nurse',
        }).success,
      ).toBe(true);
    });

    it('rejects phone starting with digits 0-5 after +91', () => {
      expect(
        inviteSchema.safeParse({
          phone: '+911234567890',
          fullName: 'Test User',
          role: 'nurse',
        }).success,
      ).toBe(false);
    });

    it('rejects phone without +91 prefix', () => {
      expect(
        inviteSchema.safeParse({
          phone: '+11234567890',
          fullName: 'Test User',
          role: 'nurse',
        }).success,
      ).toBe(false);
    });

    it('rejects short full name', () => {
      expect(
        inviteSchema.safeParse({
          phone: '+919876543210',
          fullName: 'T',
          role: 'nurse',
        }).success,
      ).toBe(false);
    });
  });
});
