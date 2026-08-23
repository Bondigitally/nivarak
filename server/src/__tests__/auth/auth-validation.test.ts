/**
 * Auth Validation Schema — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  requestOtpSchema,
  verifyOtpSchema,
  loginSchema,
  registerSchema,
  inviteSchema,
} from '../../modules/auth/auth.schema.js';

describe('Auth Schemas', () => {
  describe('requestOtpSchema', () => {
    it('accepts valid Indian phone number (+91XXXXXXXXXX)', () => {
      expect(requestOtpSchema.safeParse({ phone: '+919876543210' }).success).toBe(true);
    });

    it('accepts phone with valid mobile digit (6-9) after +91', () => {
      expect(requestOtpSchema.safeParse({ phone: '+916234567890' }).success).toBe(true);
      expect(requestOtpSchema.safeParse({ phone: '+917234567890' }).success).toBe(true);
      expect(requestOtpSchema.safeParse({ phone: '+918234567890' }).success).toBe(true);
    });

    it('rejects phone starting with digits 0-5 after +91', () => {
      expect(requestOtpSchema.safeParse({ phone: '+911234567890' }).success).toBe(false);
      expect(requestOtpSchema.safeParse({ phone: '+910234567890' }).success).toBe(false);
      expect(requestOtpSchema.safeParse({ phone: '+915234567890' }).success).toBe(false);
    });

    it('rejects phone without +91 prefix', () => {
      expect(requestOtpSchema.safeParse({ phone: '+11234567890' }).success).toBe(false);
    });

    it('rejects phone with wrong digit count', () => {
      expect(requestOtpSchema.safeParse({ phone: '+9198765432' }).success).toBe(false); // 9 digits
      expect(requestOtpSchema.safeParse({ phone: '+9198765432101' }).success).toBe(false); // 11 digits
    });

    it('rejects empty phone', () => {
      expect(requestOtpSchema.safeParse({ phone: '' }).success).toBe(false);
    });

    it('rejects missing phone', () => {
      expect(requestOtpSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('verifyOtpSchema', () => {
    it('accepts valid phone + 6-digit OTP', () => {
      expect(verifyOtpSchema.safeParse({ phone: '+919876543210', otp: '123456' }).success).toBe(true);
    });

    it('rejects OTP with less than 6 digits', () => {
      expect(verifyOtpSchema.safeParse({ phone: '+919876543210', otp: '12345' }).success).toBe(false);
    });

    it('rejects OTP with more than 6 digits', () => {
      expect(verifyOtpSchema.safeParse({ phone: '+919876543210', otp: '1234567' }).success).toBe(false);
    });

    it('rejects missing OTP', () => {
      expect(verifyOtpSchema.safeParse({ phone: '+919876543210' }).success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid phone + password', () => {
      expect(loginSchema.safeParse({ phone: '+919876543210', password: 'securePassword123' }).success).toBe(true);
    });

    it('rejects missing password', () => {
      expect(loginSchema.safeParse({ phone: '+919876543210' }).success).toBe(false);
    });

    it('rejects short password', () => {
      expect(loginSchema.safeParse({ phone: '+919876543210', password: '1234567' }).success).toBe(false);
    });

    it('accepts password at minimum length (8 chars)', () => {
      expect(loginSchema.safeParse({ phone: '+919876543210', password: '12345678' }).success).toBe(true);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'Rajesh Kumar',
        password: 'securePass123!',
      };
      expect(registerSchema.safeParse(data).success).toBe(true);
    });

    it('accepts optional email', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'Rajesh Kumar',
        password: 'securePass123!',
        email: 'rajesh@example.com',
      };
      expect(registerSchema.safeParse(data).success).toBe(true);
    });

    it('rejects invalid email', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'Rajesh Kumar',
        password: 'securePass123!',
        email: 'not-an-email',
      };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });

    it('rejects short full name (< 2 chars)', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'R',
        password: 'securePass123!',
      };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });

    it('rejects short password (< 8 chars)', () => {
      const data = {
        phone: '+919876543210',
        fullName: 'Rajesh Kumar',
        password: 'short',
      };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });
  });

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
  });
});
