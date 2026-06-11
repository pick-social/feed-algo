/**
 * @pick-social/feed-algo
 *
 * The open-source ranking algorithm behind the pick.social feed.
 * Pure function: takes survey signals in, returns an ordered list out.
 * No I/O, no secrets — what you read here is exactly what runs in prod.
 */

export interface SurveySignals {
  id: string;
  /** Unix ms timestamp of creation */
  createdAt: number;
  /** Total votes across all options */
  voteCount: number;
  /** Votes received in the last 24h */
  recentVotes: number;
  /** Follower count of the author */
  authorFollowers: number;
  /** True if the current viewer follows the author */
  viewerFollowsAuthor: boolean;
  /** True if the viewer already voted on this survey */
  viewerHasVoted: boolean;
}

export interface RankedSurvey {
  id: string;
  score: number;
}

/** Tunable weights — versioned, changes are public via git history. */
export const WEIGHTS = {
  /** Half-life of freshness decay, in hours */
  freshnessHalfLifeHours: 18,
  freshness: 4.0,
  velocity: 3.0,
  engagement: 1.5,
  social: 2.0,
  alreadyVotedPenalty: 0.15,
} as const;

/**
 * Rank surveys for a viewer's feed, best first.
 */
export function rankFeed(
  surveys: SurveySignals[],
  now: number,
): RankedSurvey[] {
  return surveys
    .map((s) => ({ id: s.id, score: score(s, now) }))
    .sort((a, b) => b.score - a.score);
}

export function score(s: SurveySignals, now: number): number {
  const ageHours = Math.max(0, (now - s.createdAt) / 3_600_000);
  const freshness = Math.exp(
    (-Math.LN2 * ageHours) / WEIGHTS.freshnessHalfLifeHours,
  );
  const velocity = Math.log1p(s.recentVotes) / Math.log(1000);
  const engagement = Math.log1p(s.voteCount) / Math.log(10_000);
  const social = s.viewerFollowsAuthor ? 1 : 0;

  let total =
    WEIGHTS.freshness * freshness +
    WEIGHTS.velocity * velocity +
    WEIGHTS.engagement * engagement +
    WEIGHTS.social * social;

  if (s.viewerHasVoted) total *= WEIGHTS.alreadyVotedPenalty;

  return total;
}
