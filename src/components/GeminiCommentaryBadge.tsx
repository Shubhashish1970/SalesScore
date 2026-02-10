"use client";

/**
 * Pulsating icon shown next to commentary when it came from the Gemini API.
 * React/CSS only — no image; white background so it fits the page.
 * Hidden when commentary is sample/fallback so users can tell if the API is working.
 */
interface Props {
  show: boolean;
  /** Optional: inline (by text) or block (above/below). Default inline. */
  className?: string;
}

export function GeminiCommentaryBadge({ show, className = "" }: Props) {
  if (!show) return null;
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-white ${className}`}
      title="Gemini assisted commentary"
      aria-label="Gemini assisted"
      role="img"
    >
      <span className="relative inline-flex items-center justify-center w-3 h-3">
        {/* Outer ring: expands and fades */}
        <span
          className="absolute inset-0 rounded-full border-2 border-red-500 gemini-pulse-ring"
          aria-hidden
        />
        {/* Inner dot: subtle scale/opacity pulse */}
        <span
          className="relative w-2 h-2 rounded-full bg-red-500 gemini-pulse-core"
          aria-hidden
        />
      </span>
    </span>
  );
}
