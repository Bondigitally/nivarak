'use client';

import { Amplify } from 'aws-amplify';

/*
 * Configure Amplify for client-side auth.
 * Both `email` and `phone` login are enabled:
 * - Phone-first sign-up uses the phone number as the Cognito username.
 * - Email login uses the USER_AUTH flow in cognito.ts which resolves
 *   the email to the phone-based account via Cognito's aliasAttributes.
 *
 * Required env vars:
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID
 */
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            loginWith: {
                email: true,
                phone: true,
            },
        },
    },
});

/**
 * Side-effect-only component that runs `Amplify.configure` on the client.
 * Rendered in the root layout before any auth call so Amplify is ready
 * regardless of which route the user lands on first.
 */
export function ConfigureAmplify() {
    return null;
}
