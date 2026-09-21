"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Thin wrapper that forwards all props to `next-themes` ThemeProvider.
 *
 * Lives here so `attribute="class"`, `defaultTheme`, and `enableSystem`
 * are configured once in `layout.tsx` rather than inline at each callsite.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
