"use client";

/**
 * Shown next to commentary when it came from the Gemini API.
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
    <img
      src="/gemini-commentary-pulse.png"
      alt="Gemini assisted"
      className={`inline-block w-5 h-5 align-middle shrink-0 ${className}`}
      title="Gemini assisted commentary"
    />
  );
}
