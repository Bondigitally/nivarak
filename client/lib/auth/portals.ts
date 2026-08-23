import type { Portal } from '@/types/auth';

export type AuthLayoutVariant = 'split' | 'centered';
export type AuthFooterVariant = 'invite' | 'contact-admin' | 'signup';

export interface PortalConfig {
  layout: AuthLayoutVariant;
  badge: string | null;
  emailLabel: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  footer: AuthFooterVariant;
  emailRequired: boolean;
}

export const PORTALS: Record<Portal, PortalConfig> = {
  consumer: {
    layout: 'split',
    badge: null,
    emailLabel: 'Email',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Enter your email and password to continue',
    registerTitle: 'Create Your Account',
    registerSubtitle: 'Enter your phone number to get started',
    footer: 'signup',
    emailRequired: true,
  },
  'care-team': {
    layout: 'centered',
    badge: 'Care team',
    emailLabel: 'Work Email',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Enter your work email and password to continue',
    registerTitle: 'Create Your Account',
    registerSubtitle: 'Enter your phone number to get started',
    footer: 'contact-admin',
    emailRequired: true,
  },
  admin: {
    layout: 'centered',
    badge: 'Admin console',
    emailLabel: 'Work Email',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Enter your work email and password to continue',
    registerTitle: 'Create Your Account',
    registerSubtitle: 'Enter your phone number to get started',
    footer: 'contact-admin',
    emailRequired: true,
  },
};

export function getPortalFromHost(host: string): Portal {
  const normalized = host.split(':')[0]?.toLowerCase() ?? '';

  if (normalized.startsWith('admin.')) return 'admin';
  if (normalized.startsWith('care.')) return 'care-team';
  return 'consumer';
}
