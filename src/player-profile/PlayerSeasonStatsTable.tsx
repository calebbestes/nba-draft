import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

interface Props {
  stats: PlayerStat[];
  means: Record<string, number>;
  stdDevs: Record<string, number>;
  type: "basic" | "advanced";
}

interface PlayerStat {
  Season: number | string;
  [key: string]: string | number | null | undefined;
}

function getStatColorZ(
  value: number | null,
  mean: number,
  stdDev: number
): string {
  if (value === null || isNaN(value) || stdDev === 0) return "transparent";

  const z = (value - mean) / stdDev;

  if (z >= 1.5) return "rgba(0, 128, 0, 0.35)";
  if (z >= 1.0) return "rgba(0, 160, 0, 0.25)";
  if (z >= 0.5) return "rgba(0, 200, 0, 0.15)";

  if (z <= -1.5) return "rgba(200, 0, 0, 0.35)";
  if (z <= -1.0) return "rgba(220, 50, 0, 0.25)";
  if (z <= -0.5) return "rgba(240, 100, 0, 0.15)";

  return "transparent";
}

export default function PlayerSeasonStatsTable({
  stats,
  means,
  stdDevs,
  type,
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
    "eFG%",
    "FG2M",
    "FG2A",
    "FG2%",
    "3P%",
    "FT",
    "FTA",
    "ORB",
    "DRB",
    "TRB",
    "AST",
    "STL",
    "BLK",
    "TOV",
    "PF",
  ];

  const displayKeys = type === "basic" ? basicStats : advancedStats;

  const noColorKeys = new Set(["Season", "w", "l"]);

  return (
    <Paper elevation={3}>
      <div className="overflow-x-auto">
        <Table style={{ minWidth: "800px" }}>
          <TableHead>
            <TableRow>
              {displayKeys.map((key) => (
                <TableCell key={key} align="center">
                  {key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((seasonStats, idx) => (
              <TableRow key={idx}>
                {displayKeys.map((key) => {
                  const raw = seasonStats[key] ?? null;
                  const value = typeof raw === "number" ? raw : null;
                  const mean = means[key];
                  const stdDev = stdDevs[key];
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
                      style={{ backgroundColor: bgColor }}
                    >
                      {typeof raw === "number"
                        ? key === "Season"
                          ? Math.round(raw)
                          : raw.toFixed(1)
                        : (raw ?? "-")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
}
