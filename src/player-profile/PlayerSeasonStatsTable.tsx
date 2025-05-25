import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";

interface Props {
  stats: PlayerStat[];
  means: Record<string, number>;
  stdDevs: Record<string, number>;
  type: "basic" | "advanced";
  compareAgainstClass?: boolean;
}
interface PlayerStat {
  Season: number | string;
  League?: string;
  [key: string]: string | number | null | undefined;
}
const statDescriptions: Record<string, string> = {
  Season: "Season Year",
  GP: "Games Played",
  "USG%": "Estimated Usage Rate (FGA + 0.44*FTA + TOV per minute)",
  Stock40: "Steals + Blocks per 40 Minutes",
  "AST/TOV": "Assist-to-Turnover Ratio",

  MP: "Minutes Per Game",
  PTS: "Points Per Game",
  FGM: "Field Goals Made",
  FGA: "Field Goals Attempted",
  "FG%": "Field Goal Percentage",
  "3PM": "Three-Point Field Goals Made",
  "3PA": "Three-Point Field Goals Attempted",
  "3P%": "Three-Point Percentage",
  FT: "Free Throws Made",
  FTA: "Free Throws Attempted",
  FTP: "Free Throw Percentage",
  ORB: "Offensive Rebounds",
  DRB: "Defensive Rebounds",
  TRB: "Total Rebounds",
  AST: "Assists",
  STL: "Steals",
  BLK: "Blocks",
  TOV: "Turnovers",
  PF: "Personal Fouls",
  "TS%": "True Shooting Percentage",
  "eFG%": "Effective Field Goal Percentage",
  PPS: "Points Per Shot",
  FTr: "Free Throw Rate",
  "3PAr": "Three-Point Attempt Rate",
  "AST/MP": "Assists Per Minute",
  "TRB/MP": "Rebounds Per Minute",
  "ORB/MP": "Offensive Rebounds Per Minute",
  "DRB/MP": "Defensive Rebounds Per Minute",
  "TOV%": "Turnover Percentage",
  "Game Score": "John Hollinger's Game Score Metric",
};

function getStatColorZ(
  value: number | null,
  mean: number,
  stdDev: number
): string {
  if (value === null || isNaN(value) || stdDev === 0) return "transparent";

  const z = (value - mean) / stdDev;

  if (z >= 1.5) return "rgba(0, 128, 0, 0.15)";
  if (z >= 1.0) return "rgba(0, 160, 0, 0.1)";
  if (z >= 0.5) return "rgba(0, 200, 0, 0.05)";
  if (z <= -1.5) return "rgba(200, 0, 0, 0.15)";
  if (z <= -1.0) return "rgba(220, 50, 0, 0.1)";
  if (z <= -0.5) return "rgba(240, 100, 0, 0.05)";

  return "transparent";
}
function groupAndFilterStatsWithLeagues(stats: PlayerStat[]) {
  const seasonGroups: Record<string, PlayerStat[]> = {};
  const skippedLeagues: Set<string> = new Set();
  const mergedStats: PlayerStat[] = [];

  // Group stats by Season
  for (const stat of stats) {
    const season = stat.Season?.toString();
    if (!season) continue;
    if (!seasonGroups[season]) seasonGroups[season] = [];
    seasonGroups[season].push(stat);

    // Track any league under 15 GP individually
    const gp = Number(stat.GP) || 0;
    if (gp < 15 && stat.League) {
      skippedLeagues.add(stat.League.toString());
    }
  }

  for (const [season, entries] of Object.entries(seasonGroups)) {
    const totalGP = entries.reduce((sum, s) => sum + (Number(s.GP) || 0), 0);
    if (totalGP < 15) continue;

    const weightedStat: PlayerStat = { Season: Number(season) };
    const numericKeys = Object.keys(entries[0]).filter(
      (key) => typeof entries[0][key] === "number" && key !== "Season"
    );

    for (const key of numericKeys) {
      const totalWeighted = entries.reduce((sum, s) => {
        const gp = Number(s.GP) || 0;
        const val = Number(s[key]) || 0;
        return sum + val * gp;
      }, 0);

      weightedStat[key] = totalGP === 0 ? 0 : totalWeighted / totalGP;
    }

    weightedStat.GP = totalGP;
    mergedStats.push(weightedStat);
  }

  // Sort by most recent season first
  mergedStats.sort((a, b) => Number(b.Season) - Number(a.Season));

  return { mergedStats, skippedLeagues: Array.from(skippedLeagues) };
}

export function calculateAdvancedSeasonStats(row: PlayerStat): PlayerStat {
  const fga = Number(row["FGA"]) || 0;
  const fta = Number(row["FTA"]) || 0;
  const pts = Number(row["PTS"]) || 0;

  const ast = Number(row["AST"]) || 0;
  const mp = Number(row["MP"]) || 1;
  const trb = Number(row["TRB"]) || 0;
  const orb = Number(row["ORB"]) || 0;
  const drb = Number(row["DRB"]) || 0;
  const tov = Number(row["TOV"]) || 0;
  const ft = Number(row["FT"]) || 0;
  const fgm = Number(row["FGM"]) || 0;
  const stl = Number(row["STL"]) || 0;
  const blk = Number(row["BLK"]) || 0;
  const pf = Number(row["PF"]) || 0;

  const ts =
    fga + 0.44 * fta !== 0 ? (pts / (2 * (fga + 0.44 * fta))) * 100 : null;
  const pps = fga !== 0 ? pts / fga : null;
  const ftr = fga !== 0 ? fta / fga : null;
  const threePar = fga !== 0 ? (Number(row["3PA"]) || 0) / fga : null;
  const astPerMin = mp !== 0 ? ast / mp : null;
  const trbPerMin = mp !== 0 ? trb / mp : null;
  const orbPerMin = mp !== 0 ? orb / mp : null;
  const drbPerMin = mp !== 0 ? drb / mp : null;
  const tovPct =
    fga + 0.44 * fta + tov !== 0
      ? (tov / (fga + 0.44 * fta + tov)) * 100
      : null;
  const gameScore =
    pts +
    0.4 * fgm -
    0.7 * fga -
    0.4 * (fta - ft) +
    0.7 * orb +
    0.3 * drb +
    stl +
    0.7 * ast +
    0.7 * blk -
    0.4 * pf -
    tov;
  const usage = mp !== 0 ? ((fga + 0.44 * fta + tov) / mp) * 100 : null;

  const stockRate = mp !== 0 ? ((stl + blk) / mp) * 40 : null;

  const astToTov = tov !== 0 ? ast / tov : null;

  return {
    ...row,
    "TS%": ts,
    PPS: pps,
    FTr: ftr,
    "3PAr": threePar,
    "AST/MP": astPerMin,
    "TRB/MP": trbPerMin,
    "ORB/MP": orbPerMin,
    "DRB/MP": drbPerMin,
    "TOV%": tovPct,
    "Game Score": gameScore,
    "USG%": usage,
    Stock40: stockRate,
    "AST/TOV": astToTov,
  };
}

export default function PlayerSeasonStatsTable({
  stats,
  means,
  stdDevs,
  type,
  compareAgainstClass = true,
}: Props) {
  if (!stats) return null;
  const basicStats = [
    "Season",
    "GP",
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
  ];

  const advancedStats = [
    "Season",
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
  ];
  const { mergedStats, skippedLeagues } = groupAndFilterStatsWithLeagues(stats);
  const displayKeys = type === "basic" ? basicStats : advancedStats;

  const derivedMeans: Record<string, number> = {};
  const derivedStdDevs: Record<string, number> = {};

  if (!compareAgainstClass) {
    const keys = displayKeys.filter((k) => k !== "Season");

    keys.forEach((key) => {
      const values = mergedStats
        .map((s) => s[key])
        .filter((v): v is number => typeof v === "number" && !isNaN(v));

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            values.length
        );
        derivedMeans[key] = mean;
        derivedStdDevs[key] = stdDev;
      }
    });
  }

  const noColorKeys = new Set(["Season", "w", "l"]);

  return (
    <Paper
      elevation={0}
      className="rounded-xl overflow-hidden border border-white/10"
    >
      <div className="overflow-x-auto">
        <Table style={{ minWidth: "800px" }}>
          <TableHead>
            <TableRow>
              {displayKeys.map((key) => (
                <Tooltip
                  key={key}
                  title={statDescriptions[key] || key}
                  placement="top"
                  arrow
                >
                  <TableCell
                    align="center"
                    className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                  >
                    {key}
                  </TableCell>
                </Tooltip>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {mergedStats.map((originalStats, idx) => {
              const seasonStats =
                type === "advanced"
                  ? calculateAdvancedSeasonStats(originalStats)
                  : originalStats;

              return (
                <TableRow
                  key={idx}
                  className="transition-colors hover:bg-white/5"
                >
                  {displayKeys.map((key) => {
                    const raw = seasonStats[key] ?? null;
                    const useMean = compareAgainstClass ? means : derivedMeans;
                    const useStdDev = compareAgainstClass
                      ? stdDevs
                      : derivedStdDevs;
                    const mean = useMean[key];
                    const stdDev = useStdDev[key];
                    const value = typeof raw === "number" ? raw : null;
                    const bgColor =
                      !noColorKeys.has(key) &&
                      value !== null &&
                      typeof mean === "number" &&
                      typeof stdDev === "number"
                        ? getStatColorZ(value, mean, stdDev)
                        : "transparent";

                    return (
                      <TableCell
                        key={key}
                        align="center"
                        className={`text-sm py-3 border-b border-white/5 font-medium
    ${key === "Season" ? "text-[#00A3E0] font-semibold" : "text-white/90"}
  `}
                        style={{ backgroundColor: bgColor }}
                      >
                        <Tooltip
                          title={
                            typeof mean === "number"
                              ? `Average for draft class is ${key === "GP" ? Math.round(mean) : mean.toFixed(1)}`
                              : ""
                          }
                          arrow
                          placement="top"
                        >
                          <span>
                            {typeof raw === "number"
                              ? key === "Season"
                                ? Math.round(raw)
                                : key === "GP"
                                  ? Math.round(raw)
                                  : raw.toFixed(1)
                              : (raw ?? "-")}
                          </span>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {skippedLeagues.length > 0 && (
          <div className="text-xs text-blue/60 mt-2 px-4">
            * Season stats do not include competitions in{" "}
            {skippedLeagues.join(", ")}
          </div>
        )}
      </div>
    </Paper>
  );
}
