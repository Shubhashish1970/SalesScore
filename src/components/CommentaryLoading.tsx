"use client";

/**
 * Skeleton / shimmer loading indicator for Gemini commentary boxes.
 * Mimics text lines with a sweeping shimmer — sets expectation for incoming content.
 */
export function CommentaryLoading() {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0" aria-label="Loading insights">
      <div className="h-3.5 rounded skeleton-shimmer" style={{ width: "92%" }} />
      <div className="h-3.5 rounded skeleton-shimmer" style={{ width: "78%" }} />
      <div className="h-3.5 rounded skeleton-shimmer" style={{ width: "55%" }} />
    </div>
  );
}
