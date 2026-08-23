export type Portal = 'consumer' | 'care-team' | 'admin';

export type AuthMode = 'login' | 'register' | 'forgot-password';

export type AuthMethod = 'email' | 'phone';

export type AuthStep =
  | 'login-email'
  | 'login-phone'
  | 'login-otp'
  | 'signup-phone'
  | 'signup-otp'
  | 'signup-complete'
  | 'signup-success'
  | 'forgot-password'
  | 'forgot-otp'
  | 'reset-password'
  | 'reset-success';

export interface EmailLoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface PhoneLoginValues {
  phone: string;
}

export interface OtpVerificationValues {
  otp: string;
}

export interface ForgotPasswordValues {
  email: string;
}

export interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

export interface CompleteRegistrationValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
