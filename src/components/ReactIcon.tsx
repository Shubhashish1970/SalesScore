"use client";

/** React logo icon (atom-style orbits) */
export function ReactIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-11.5 -10.23174 23 20.46348"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle r="2.05" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <ellipse cx="0" cy="0" rx="11" ry="4.2" />
        <ellipse cx="0" cy="0" rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
