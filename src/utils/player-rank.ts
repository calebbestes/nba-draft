// src/utils/rankUtils.ts

import { scoutRankings } from "../data/scoutRankings";

export function getRank(
  playerId: number,
  source: string,
  avgRankMap?: Record<number, number>
): number | null {
  if (source === "Average Rank" && avgRankMap) {
    return avgRankMap[playerId] ?? null;
  }

  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return null;

  const value = (ranking as Record<string, number | null>)[source];
  return typeof value === "number" ? value : null;
}
export function getMinMaxRank(
  playerId: number
): [number, string, number, string] {
  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return [Infinity, "", Infinity, ""];

  const entries = Object.entries(ranking).filter(
    ([key, val]) => key !== "playerId" && typeof val === "number"
  ) as [string, number][];

  if (entries.length === 0) return [Infinity, "", Infinity, ""]; // add this line

  let minEntry = entries[0];
  let maxEntry = entries[0];

  for (const entry of entries) {
    if (entry[1] < minEntry[1]) minEntry = entry;
    if (entry[1] > maxEntry[1]) maxEntry = entry;
  }

  return [minEntry[1], minEntry[0], maxEntry[1], maxEntry[0]];
}

export function getOutlierType(
  playerId: number,
  source: string
): "high" | "low" | null {
  if (source === "Average Rank") return null;

  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return null;

  const entries = Object.entries(ranking).filter(
    ([key, val]) => key !== "playerId" && typeof val === "number"
  ) as [string, number][];

  const values = entries.map(([, val]) => val);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
  );

  const selectedValue = (ranking as Record<string, number>)[source];
  const zScore = (selectedValue - mean) / stdDev;

  if (zScore <= -1.25) return "high";
  if (zScore >= 1.25) return "low";
  return null;
}
