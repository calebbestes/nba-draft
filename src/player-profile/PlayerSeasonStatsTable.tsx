import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

type Props = {
  stats: Record<string, number | null>;
  means: Record<string, number>;
  stdDevs: Record<string, number>;
};
const filteredStats = Object.fromEntries(
  Object.entries(seasonStats ?? {}).filter(
    ([key, value]) => typeof value === "number"
  )
);

function getStatColorZ(
  value: number | null,
  mean: number,
  stdDev: number
): string {
  if (value === null || isNaN(value) || stdDev === 0) return "transparent";

  const z = (value - mean) / stdDev;

  if (z >= 1.5) return "rgba(0, 128, 0, 0.35)"; // strong green
  if (z >= 1.0) return "rgba(0, 160, 0, 0.25)"; // medium green
  if (z >= 0.5) return "rgba(0, 200, 0, 0.15)"; // light green

  if (z <= -1.5) return "rgba(200, 0, 0, 0.35)"; // strong red
  if (z <= -1.0) return "rgba(220, 50, 0, 0.25)"; // medium red
  if (z <= -0.5) return "rgba(240, 100, 0, 0.15)"; // light red

  return "transparent"; // neutral
}

export default function PlayerSeasonStatsTable({
  stats,
  means,
  stdDevs,
}: Props) {
  if (!stats) return null;

  const displayKeys = Object.keys(stats).filter(
    (key) => key !== "playerId" && key !== "age"
  );

  return (
    <Paper elevation={3}>
      <Table>
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
          <TableRow>
            {displayKeys.map((key) => {
              const value = stats[key];
              const mean = means[key];
              const stdDev = stdDevs[key];
              const bgColor =
                typeof value === "number" &&
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
                  {value ?? "-"}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}
