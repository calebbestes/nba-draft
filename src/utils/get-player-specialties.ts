import { seasonLogs } from "../data/season-logs";
import { bio } from "../data/bio";

export type Specialty =
  | "All"
  | "Utility Big"
  | "Stretch Big"
  | "Three and D"
  | "Floor General"
  | "Shot Creator"
  | "Starred";

const fallbackCycle: Specialty[] = [
  "Utility Big",
  "Stretch Big",
  "Three and D",
  "Floor General",
  "Shot Creator",
  "Starred",
];

export function getSpecialtyMap(
  players: { playerId: number }[]
): Record<number, Specialty> {
  const map: Record<number, Specialty> = {};
  let fallbackIndex = 0;

  for (const player of players) {
    const log = seasonLogs.find((log) => log.playerId === player.playerId);
    const profile = bio.find((b) => b.playerId === player.playerId);
    if (!log || !profile) continue;

    const {
      BLK,
      STL,
      AST,
      FGA,
      FT,
      FTA,
      TOV,
      TRB,
      "3PA": threePA,
      "3P%": threeP,
      PTS,
    } = log;

    const height = profile.height ?? 0;

    const isUtilityBig =
      height >= 80 && TRB >= 5.5 && BLK >= 1.0 && threePA < 2.0;

    const isStretchBig = height >= 80 && TRB >= 5 && threePA >= 2;

    const isThreeAndD = STL >= 1.0 && AST < 4 && threeP >= 0.36;

    const isFloorGeneral = AST >= 4;

    const isShotCreator = TOV > 1.5 && PTS > 15;

    let specialty: Specialty;

    if (isUtilityBig) {
      specialty = "Utility Big";
    } else if (isStretchBig) {
      specialty = "Stretch Big";
    } else if (isThreeAndD) {
      specialty = "Three and D";
    } else if (isFloorGeneral) {
      specialty = "Floor General";
    } else if (isShotCreator) {
      specialty = "Shot Creator";
    } else {
      // Evenly distribute unclassified players across the 5 buckets
      specialty = fallbackCycle[fallbackIndex % fallbackCycle.length];
      fallbackIndex++;
    }

    console.log(`${profile.name} (${specialty})`, {
      height,
      BLK,
      STL,
      AST,
      TOV,
      FGA,
      FT,
      FTA,
      TRB,
      threePA,
      threeP,
      PTS,
    });

    map[player.playerId] = specialty;
  }

  return map;
}
