'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Stub shipped in auth-lib so primitives/layout consumers can typecheck.
 * Full preload gate lands in restructure/auth-screens.
 */
type AuthPreloadContextValue = {
  ready: boolean;
  markHeroReady: () => void;
  markCardReady: () => void;
};

const AuthPreloadContext = createContext<AuthPreloadContextValue | null>(null);

export function useAuthPreload() {
  return useContext(AuthPreloadContext);
}

export function AuthPreloadProvider({
  children,
}: {
  waitForHero?: boolean;
  bootstrapped?: boolean;
  children: ReactNode;
}) {
  return (
    <AuthPreloadContext.Provider
      value={{
        ready: true,
        markHeroReady: () => {},
        markCardReady: () => {},
      }}
    >
      {children}
    </AuthPreloadContext.Provider>
  );
}
