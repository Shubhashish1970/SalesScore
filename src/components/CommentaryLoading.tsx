"use client";

/**
 * Simple loading indicator for Gemini commentary boxes.
 * Three dots that pulse in sequence — minimal and intuitive.
 */
export function CommentaryLoading() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Loading insights">
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-commentary-dot" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-commentary-dot" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-commentary-dot" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
