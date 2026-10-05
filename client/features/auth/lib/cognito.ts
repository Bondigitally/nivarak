import {
  autoSignIn,
  confirmSignIn,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateUserAttributes,
  type SignInOutput,
} from 'aws-amplify/auth';

/**
 * Session-scoped key for the temp password created during phone-first sign-up.
 * The temp password is needed again in `completeRegisterProfile` to call
 * `updatePassword`, which requires the old password. sessionStorage is cleared
 * automatically when the tab closes.
 */
const TEMP_PASSWORD_KEY = 'nivarak_signup_temp';

function isAuthError(err: unknown, name: string): boolean {
  return err instanceof Error && err.name === name;
}

export function getSignInErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Sign in failed.';
  if (
    err.name === 'NotAuthorizedException' ||
    err.name === 'UserNotFoundException' ||
    /incorrect username or password/i.test(err.message)
  ) {
    return 'Incorrect email or password';
  }
  return err.message || 'Sign in failed.';
}

/**
 * Walks the Cognito multi-step password sign-in ladder.
 * Pools configured with USER_AUTH may require factor selection before the
 * password step; newly-created accounts may still be in NEW_PASSWORD_REQUIRED.
 * PASSWORD_SRP is preferred over plain PASSWORD for security when available.
 */
async function finishPasswordSignIn(
  result: SignInOutput,
  password: string,
): Promise<SignInOutput> {
  let current = result;

  if (current.nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION') {
    const challenges = current.nextStep.availableChallenges ?? [];
    const preferred = challenges.includes('PASSWORD_SRP')
      ? 'PASSWORD_SRP'
      : challenges.includes('PASSWORD')
        ? 'PASSWORD'
        : 'PASSWORD_SRP';
    current = await confirmSignIn({ challengeResponse: preferred });
  }

  if (current.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_PASSWORD') {
    current = await confirmSignIn({ challengeResponse: password });
  }

  // First login after sign-up may still require confirming the permanent password.
  if (current.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    current = await confirmSignIn({ challengeResponse: password });
  }

  return current;
}

/**
 * Sends an OTP to the given E.164 phone number via a Cognito Custom Auth Flow.
 * The pool must have the "Create Auth Challenge", "Define Auth Challenge", and
 * "Verify Auth Challenge Response" Lambda triggers configured.
 */
export async function sendLoginPhoneOtp(phone: string) {
  try {
    await signOut();
  } catch {
    // No existing session.
  }

  try {
    const { nextStep } = await signIn({
      username: phone,
      options: { authFlowType: 'CUSTOM_WITHOUT_SRP' },
    });

    if (nextStep.signInStep !== 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
      throw new Error(
        'Phone sign-in requires the Cognito Custom Auth Flow Lambda triggers to be configured.',
      );
    }
  } catch (err) {
    if (isAuthError(err, 'UserNotFoundException')) {
      throw new Error('No account found for this phone number.');
    }
    throw err;
  }
}

export async function confirmLoginPhoneOtp(otp: string) {
  const result = await confirmSignIn({ challengeResponse: otp });
  if (!result.isSignedIn) {
    throw new Error('Phone sign-in could not be completed.');
  }
}

/** Email+password login. Uses USER_AUTH so Cognito can resolve email when username is the phone. */
export async function signInWithEmailPassword(email: string, password: string) {
  const username = email.trim().toLowerCase();

  try {
    await signOut();
  } catch {
    // No existing session.
  }

  try {
    const result = await signIn({
      username,
      password,
      options: {
        authFlowType: 'USER_AUTH',
        preferredChallenge: 'PASSWORD_SRP',
      },
    });
    return finishPasswordSignIn(result, password);
  } catch (err) {
    // Fall back to legacy signIn for pools that don't support USER_AUTH.
    if (
      isAuthError(err, 'InvalidParameterException') ||
      isAuthError(err, 'InvalidUserPoolConfigurationException')
    ) {
      return signIn({ username, password });
    }
    throw err;
  }
}

function readTempPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TEMP_PASSWORD_KEY);
}

function writeTempPassword(password: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TEMP_PASSWORD_KEY, password);
}

function clearTempPassword() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TEMP_PASSWORD_KEY);
}

/**
 * Generates a random password that satisfies the Cognito pool policy.
 * The `Aa1!` suffix guarantees uppercase, digit, and special character rules
 * regardless of the random hex segment.
 */
function generateTempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex}Aa1!`;
}

function getOrCreateTempPassword(): string {
  const existing = readTempPassword();
  if (existing) return existing;
  const next = generateTempPassword();
  writeTempPassword(next);
  return next;
}

/** Creates the Cognito user with the phone as username and sends the SMS OTP. */
export async function sendRegisterPhoneOtp(phone: string) {
  const password = getOrCreateTempPassword();

  try {
    await signUp({
      username: phone,
      password,
      options: {
        userAttributes: { phone_number: phone },
        autoSignIn: true,
      },
    });
  } catch (err) {
    if (isAuthError(err, 'UsernameExistsException')) {
      try {
        await resendSignUpCode({ username: phone });
        return;
      } catch (resendErr) {
        if (
          isAuthError(resendErr, 'InvalidParameterException') ||
          isAuthError(resendErr, 'NotAuthorizedException')
        ) {
          throw new Error(
            'An account with this phone number already exists. Please log in.',
          );
        }
        throw resendErr;
      }
    }
    throw err;
  }
}

/** Confirms the SMS OTP and signs the new user in. */
export async function confirmRegisterPhoneOtp(phone: string, otp: string) {
  const { nextStep } = await confirmSignUp({
    username: phone,
    confirmationCode: otp,
  });

  if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
    await autoSignIn();
    return;
  }

  const password = readTempPassword();
  if (!password) {
    throw new Error('Sign-up session expired. Please request a new OTP.');
  }

  await signIn({ username: phone, password });
}

/**
 * Attaches name and email to the Cognito account and swaps the temp password
 * for the user's chosen password. Email is set without an OTP verification step
 * because the address is confirmed via the onboarding profile form instead.
 * Clears the temp password from sessionStorage on success.
 */
export async function completeRegisterProfile(values: {
  fullName: string;
  email: string;
  password: string;
}) {
  const oldPassword = readTempPassword();
  if (!oldPassword) {
    throw new Error('Sign-up session expired. Please start again from your phone number.');
  }

  await updateUserAttributes({
    userAttributes: {
      name: values.fullName,
      email: values.email.trim().toLowerCase(),
    },
  });

  await updatePassword({
    oldPassword,
    newPassword: values.password,
  });

  clearTempPassword();
}
