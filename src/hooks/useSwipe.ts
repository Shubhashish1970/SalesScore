"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Horizontal swipe: right = next, left = previous.
 * Touch events for mobile; only horizontal swipe changes screen (vertical scroll still works).
 */
const SWIPE_THRESHOLD_PX = 50;
const MAX_INDEX = 5; // screens 0..5

export function useSwipe(initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStart = useRef({ x: 0, y: 0 });

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.targetTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStart.current.x;
    const deltaY = t.clientY - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX < SWIPE_THRESHOLD_PX || absY > absX) return;
    if (deltaX > 0) setCurrentIndex((i) => (i < MAX_INDEX ? i + 1 : i));
    else setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  return { currentIndex, setCurrentIndex, goNext, goPrev, onTouchStart, onTouchEnd };
}
