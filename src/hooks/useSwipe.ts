"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Horizontal swipe: right = next, left = previous.
 * Touch events for mobile; UI provides Previous/Next arrows.
 */
const SWIPE_THRESHOLD_PX = 60;
const MAX_INDEX = 5; // screens 0..5

export function useSwipe(initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD_PX) setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
    else if (delta < -SWIPE_THRESHOLD_PX) setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  return { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd };
}
