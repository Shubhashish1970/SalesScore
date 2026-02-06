"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Horizontal swipe only (right = forward). No back-swipe to keep one direction.
 * Uses touch events for mobile; optional keyboard/button fallback in UI.
 */
const SWIPE_THRESHOLD_PX = 60;
const MAX_INDEX = 5; // screens 0..5

export function useSwipe(initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD_PX) setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
  }, []);

  return { currentIndex, setCurrentIndex, goNext, onTouchStart, onTouchEnd };
}
