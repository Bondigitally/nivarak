"use client";

import { useCallback, useEffect, useState } from "react";

/** Survives remounts (route changes, conditional trees). */
const playedIds = new Set<string>();

/**
 * Enter animations (Recharts lines/radar, custom gauges) run once per id.
 * Later remounts / resizes skip the draw.
 */
export function useOnceAnimation(id: string) {
  const [isAnimationActive, setIsAnimationActive] = useState(
    () => !playedIds.has(id),
  );

  const onAnimationEnd = useCallback(() => {
    playedIds.add(id);
    setIsAnimationActive(false);
  }, [id]);

  // Safety: if onAnimationEnd never fires, still lock after a beat.
  useEffect(() => {
    if (!isAnimationActive) return;
    const timer = window.setTimeout(onAnimationEnd, 2500);
    return () => window.clearTimeout(timer);
  }, [isAnimationActive, onAnimationEnd]);

  return { isAnimationActive, onAnimationEnd } as const;
}

/** True when this id already finished an enter animation. */
export function hasAnimatedOnce(id: string) {
  return playedIds.has(id);
}

export function markAnimatedOnce(id: string) {
  playedIds.add(id);
}
