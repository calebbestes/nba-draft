import { bio } from "../data/bio";
import { seasonLogs } from "../data/season-logs";
export type Specialty =
  | "All"
  | "Starred"
  | "Versatile"
  | "Stretch Big"
  | "Three and D"
  | "Pure Scorer"
  | "Potential"
  | "Utility Big";

export type PlayerSeasonLog = (typeof seasonLogs)[number];

export function classifyPlayer(player: PlayerSeasonLog): Specialty {
  const threePointPercentage = player["3P%"];
  const ftMade = player.FT;
  const threePointMade = player["3PM"];
  const rebounds = player.TRB;
  const assists = player.AST;
  const points = player.PTS;
  const threePointAttempts = player["3PA"];
  const height = bio.find((p) => p.playerId === player.playerId)?.height || 0;

  const bigHeightThreshold = 80; // roughly 6'8" and taller

  if (assists >= 4 && points > 10 && rebounds > 4) {
    return "Versatile";
  }
  if (height >= bigHeightThreshold && threePointMade <= 1 && rebounds > 6) {
    return "Utility Big";
  }

  if (height >= bigHeightThreshold && assists < 4 && threePointMade > 1) {
    return "Stretch Big";
  }

  if (
    height <= bigHeightThreshold &&
    threePointPercentage >= 35 &&
    assists < 3 &&
    ftMade < 3.5
  ) {
    return "Three and D";
  }

  if (points >= 10 && ftMade > 2.3 && threePointAttempts > 2.7) {
    return "Pure Scorer";
  } else return "Potential";
}

export function getSpecialtyMap(
  players: { playerId: number }[]
): Record<number, Specialty> {
  const specialtyMap: Record<number, Specialty> = {};

  players.forEach(({ playerId }) => {
    const playerLog = seasonLogs.find((log) => log.playerId === playerId);

    if (playerLog) {
      specialtyMap[playerId] = classifyPlayer(playerLog);
    } else {
      specialtyMap[playerId] = "Versatile";
    }
  });

  return specialtyMap;
}
