/**
 * Gemini integration types and merge helper.
 * Re-exports the commentary contract; applies Gemini output onto ScorecardData.
 */

import type { ScorecardData } from "@/types/scorecard";
import type { GeminiCommentaryOutput } from "@/lib/gemini-prompts";

export type { GeminiCommentaryOutput };

/**
 * Merges Gemini commentary into a scorecard. Only overwrites fields that exist
 * on the commentary object; leaves other scorecard fields unchanged.
 */
export function mergeCommentaryIntoScorecard(
  scorecard: ScorecardData,
  commentary: GeminiCommentaryOutput
): ScorecardData {
  return {
    ...scorecard,
    achievementMessage: commentary.achievementMessage ?? scorecard.achievementMessage,
    growthComment: commentary.growthComment ?? scorecard.growthComment,
    dsoComment: commentary.dsoComment ?? scorecard.dsoComment,
    overdueComment: commentary.overdueComment ?? scorecard.overdueComment,
    productMixComment: commentary.productMixComment ?? scorecard.productMixComment,
    recommendedActions:
      Array.isArray(commentary.recommendedActions) && commentary.recommendedActions.length > 0
        ? commentary.recommendedActions
        : scorecard.recommendedActions,
  };
}
