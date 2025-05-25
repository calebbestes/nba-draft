import { calculateAdvancedSeasonStats } from "../player-profile/PlayerSeasonStatsTable";
import { type PlayerStat } from "../types";

export function calculatePeerStats(comparisonStats: PlayerStat[]): {
  means: Record<string, number>;
  stdDevs: Record<string, number>;
} {
  const keys = [
    "MP",
    "PTS",
    "FGM",
    "FGA",
    "FG%",
    "3PM",
    "3PA",
    "3P%",
    "FT",
    "FTA",
    "FTP",
    "ORB",
    "DRB",
    "TRB",
    "AST",
    "STL",
    "BLK",
    "TOV",
    "PF",
    "TS%",
    "eFG%",
    "PPS",
    "FTr",
    "3PAr",
    "AST/MP",
    "TRB/MP",
    "ORB/MP",
    "DRB/MP",
    "TOV%",
    "Game Score",
    "USG%",
    "Stock40",
    "AST/TOV",
  ];

  const valuesByKey: Record<string, number[]> = {};

  comparisonStats.forEach((row) => {
    const adv = calculateAdvancedSeasonStats(row);
    keys.forEach((key) => {
      const val = adv[key];
      if (typeof val === "number" && !isNaN(val)) {
        (valuesByKey[key] ||= []).push(val);
      }
    });
  });

  const means: Record<string, number> = {};
  const stdDevs: Record<string, number> = {};

  keys.forEach((key) => {
    const vals = valuesByKey[key] || [];
    if (vals.length) {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      means[key] = mean;
      stdDevs[key] = Math.sqrt(
        vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length
      );
    }
  });

  return { means, stdDevs };
}
