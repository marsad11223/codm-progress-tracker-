import type { GrindCandidate, NextBestGrind } from "@/types";

function difficultyRank(candidate: GrindCandidate): number {
  return candidate.weapon.difficultyScore == null
    ? Number.POSITIVE_INFINITY
    : candidate.weapon.difficultyScore;
}

function roadmapRank(candidate: GrindCandidate): number {
  return candidate.roadmapPosition == null
    ? Number.POSITIVE_INFINITY
    : candidate.roadmapPosition;
}

function compareCandidates(a: GrindCandidate, b: GrindCandidate): number {
  if (a.weapon.progressPercentage !== b.weapon.progressPercentage) {
    return b.weapon.progressPercentage - a.weapon.progressPercentage;
  }
  const difficulty = difficultyRank(a) - difficultyRank(b);
  if (difficulty !== 0) return difficulty;
  const roadmap = roadmapRank(a) - roadmapRank(b);
  if (roadmap !== 0) return roadmap;
  return a.weapon.name.localeCompare(b.weapon.name);
}

export function rankOpenWeapons(candidates: GrindCandidate[]) {
  return candidates
    .filter((candidate) => candidate.weapon.active && !candidate.weapon.goldUnlocked)
    .sort(compareCandidates)
    .map((candidate) => candidate.weapon);
}

export function pickNextBest(candidates: GrindCandidate[]): NextBestGrind | null {
  const eligible = candidates.filter(
    (candidate) => candidate.weapon.active && !candidate.weapon.goldUnlocked,
  );
  if (eligible.length === 0) return null;

  const started = eligible.filter(
    (candidate) => candidate.weapon.progressPercentage > 0,
  );
  const narrowedToStarted = started.length > 0;
  const pool = [...(narrowedToStarted ? started : eligible)].sort(
    compareCandidates,
  );
  const winner = pool[0];
  if (!winner) return null;

  if (eligible.length === 1) {
    return {
      weapon: winner.weapon,
      reasons: ["Only active weapon left without Gold in this view."],
    };
  }

  const reasons: string[] = [];
  if (narrowedToStarted && started.length < eligible.length) {
    reasons.push("Finishing an open gun beats opening a new one.");
  }

  const sameProgress = pool.filter(
    (candidate) =>
      candidate.weapon.progressPercentage === winner.weapon.progressPercentage,
  );
  if (sameProgress.length === 1) {
    reasons.push(
      narrowedToStarted
        ? "Closest to Gold among guns you already started."
        : "Highest progress in this view.",
    );
    return { weapon: winner.weapon, reasons };
  }

  const winnerDifficulty = difficultyRank(winner);
  const difficultyDecides = sameProgress.some(
    (candidate) => difficultyRank(candidate) !== winnerDifficulty,
  );
  const sameDifficulty = sameProgress.filter(
    (candidate) => difficultyRank(candidate) === winnerDifficulty,
  );
  if (difficultyDecides && sameDifficulty.length === 1) {
    reasons.push("Lowest recorded difficulty among equal progress.");
    if (winner.weapon.difficultyReasons.length > 0) {
      for (const reason of winner.weapon.difficultyReasons) {
        reasons.push(`${reason} (not an official rating).`);
      }
    }
    return { weapon: winner.weapon, reasons };
  }

  const winnerRoadmap = roadmapRank(winner);
  const sameRoadmap = sameDifficulty.filter(
    (candidate) => roadmapRank(candidate) === winnerRoadmap,
  );
  if (sameDifficulty.length > 1 && sameRoadmap.length === 1) {
    reasons.push("Earlier on your roadmap among guns with the same progress.");
    return { weapon: winner.weapon, reasons };
  }

  if (!narrowedToStarted && winner.weapon.progressPercentage === 0) {
    reasons.push("Nothing in this view is started yet.");
  }
  reasons.push("Alphabetical order among guns with the same progress.");
  return { weapon: winner.weapon, reasons };
}
