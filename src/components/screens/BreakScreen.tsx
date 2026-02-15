"use client";

import { useMemo } from "react";

/**
 * Break screen when scorecard/KPI fetch fails, no valid link, or invalid user (wrong mobile).
 */
interface Props {
  onRetry?: () => void;
  /** Optional custom message when no mobile in URL (e.g. "Open via link with ?mobile=...&role=TM". */
  message?: string;
  /** "invalidUser" = wrong mobile / no data; show humorous messages + Retry. */
  /** "accessDisabled" = URL or token access is disabled by admin config. */
  variant?: "noLink" | "fetchError" | "invalidUser" | "accessDisabled";
}

const FETCH_ERROR_MESSAGES = [
  "We searched high and low but couldn't find what you're looking for. The scorecard elves must be on a coffee break!",
  "Oops! Our data gremlins ran off with your scorecard. Give it another shot?",
  "Something went sideways — our servers are doing the cha-cha. Try again in a moment!",
  "We lost this page in the Bermuda Triangle of the internet. Fancy a retry?",
  "The scorecard took a wrong turn at Albuquerque. Let's try that again!",
];

const NO_LINK_TITLES = [
  "Psst! Your magic link is hiding",
  "We need your backstage pass",
  "Link required — and we mean the digital kind!",
];

const ACCESS_DISABLED_MESSAGE =
  "This access method is currently disabled. Please use the enabled access method (URL or token) or contact your admin.";

const INVALID_USER_MESSAGES = [
  "This number doesn't ring a bell! Double-check your link or try again.",
  "We couldn't find this mobile in our records. The scorecard elves are scratching their heads!",
  "Oops! Wrong number — our database drew a blank. Give it another shot?",
  "This link led us to a dead end. Maybe the gremlins mixed up the digits?",
  "Hmm, we've got nothing for this one. Try your personalized link again!",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function BreakScreen({ onRetry, message, variant }: Props) {
  const isNoLink = Boolean(message);
  const isInvalidUser = variant === "invalidUser";
  const isAccessDisabled = variant === "accessDisabled";
  const humorousTitle = useMemo(() => (isNoLink ? pickRandom(NO_LINK_TITLES) : null), [isNoLink]);
  const humorousBody = useMemo(
    () =>
      isInvalidUser
        ? pickRandom(INVALID_USER_MESSAGES)
        : !isNoLink
          ? pickRandom(FETCH_ERROR_MESSAGES)
          : null,
    [isNoLink, isInvalidUser]
  );

  return (
    <section className="min-h-[80dvh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        {isAccessDisabled
          ? "Access disabled"
          : isNoLink
            ? (humorousTitle ?? "Link required")
            : isInvalidUser
              ? "Wrong call!"
              : "We lost this page"}
      </h2>
      <p className="text-slate-600 text-base leading-relaxed max-w-sm mb-8">
        {isAccessDisabled
          ? ACCESS_DISABLED_MESSAGE
          : message ?? (humorousBody ?? "We searched high and low but couldn't find what you're looking for. Let's find a better place for you to go.")}
      </p>
      {!message && (
        <button
          type="button"
          onClick={onRetry ?? (() => window.location.reload())}
          className="px-6 py-3 rounded-lg bg-amber-600 text-white font-medium text-base hover:bg-amber-700 transition-colors"
          aria-label="Try again"
        >
          Try again
        </button>
      )}
      {/* Whimsical illustration: head-in-hole style */}
      <div className="mt-12 select-none" aria-hidden>
        <svg
          viewBox="0 0 140 100"
          className="w-36 h-28 mx-auto text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Ground */}
          <ellipse cx="70" cy="80" rx="50" ry="10" opacity="0.5" />
          {/* Body & legs sticking up */}
          <path d="M40 75 Q35 45 55 35" strokeWidth="2" />
          <path d="M100 75 Q105 45 85 35" strokeWidth="2" />
          <path d="M55 35 Q70 25 85 35" strokeWidth="2" />
          {/* Hole */}
          <ellipse cx="70" cy="28" rx="25" ry="10" className="text-slate-500" fill="rgba(30,41,59,0.1)" />
          <path d="M45 28 L95 28" strokeWidth="2.5" className="text-slate-600" />
        </svg>
      </div>
    </section>
  );
}
