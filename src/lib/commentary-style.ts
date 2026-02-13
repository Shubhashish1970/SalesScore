/**
 * Maps badge/band colors to Gemini commentary box styles.
 * Badge colors: emerald, lime, amber, red.
 */

export type CommentaryVariant = "emerald" | "lime" | "amber" | "red";

/** Light background + text + border for commentary box. */
export function getCommentaryBoxStyle(variant: CommentaryVariant): string {
  const styles: Record<CommentaryVariant, string> = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    lime: "bg-lime-50 text-lime-800 border-lime-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
  };
  return styles[variant];
}

/** Map DSO roundelColor (e.g. "bg-amber-500 text-slate-900") to commentary variant. */
export function roundelColorToVariant(roundelColor: string | undefined): CommentaryVariant {
  if (!roundelColor) return "amber";
  if (roundelColor.includes("emerald")) return "emerald";
  if (roundelColor.includes("lime")) return "lime";
  if (roundelColor.includes("amber")) return "amber";
  if (roundelColor.includes("red")) return "red";
  return "amber";
}

/** Map badge color class (green/amber/red) to commentary variant. */
export function badgeColorToVariant(badgeColor: string): CommentaryVariant {
  if (badgeColor.includes("emerald")) return "emerald";
  if (badgeColor.includes("amber")) return "amber";
  if (badgeColor.includes("red")) return "red";
  return "amber";
}

/** Growth band (green/amber/red) to commentary variant. */
export function growthBandToVariant(band: "green" | "amber" | "red"): CommentaryVariant {
  if (band === "green") return "emerald";
  if (band === "amber") return "amber";
  return "red";
}

/** Score band from finalScore (redEnd, amberEnd) to commentary variant. */
export function scoreBandToVariant(score: number, redEnd: number, amberEnd: number): CommentaryVariant {
  if (score >= amberEnd) return "emerald";
  if (score >= redEnd) return "amber";
  return "red";
}
