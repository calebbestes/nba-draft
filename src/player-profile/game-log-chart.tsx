import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useMemo, useState } from "react";

interface GameLogBase {
  date: string;
  opponent?: string;
  result?: string;
  timePlayed?: string;
  pts?: number;
  [key: string]: string | number | null | undefined;
}

type GameLog = GameLogBase & {
  [key: string]: string | number | null | undefined;
};

type Props = {
  gameLogs: GameLog[];
};

const statKeys = [
  "usgPct",
  "tsPct",
  "efgPct",
  "astPct",
  "rebPct",
  "tovPct",
  "ftr",
  "pps",
  "gameScore",
  "pts",
];

const statLabels: Record<string, string> = {
  usgPct: "USG%",
  tsPct: "TS%",
  efgPct: "eFG%",
  astPct: "AST%",
  rebPct: "REB%",
  tovPct: "TOV%",
  ftr: "FTr",
  pps: "PPS",
  gameScore: "Game Score",
  pts: "PTS",
};

const basicStatKeys = [
  "fgm",
  "fga",
  "fg%",
  "tpm",
  "tpa",
  "tp%",
  "ftm",
  "fta",
  "ft%",
  "oreb",
  "dreb",
  "reb",
  "ast",
  "stl",
  "blk",
  "tov",
  "pf",
  "pts",
  "plusMinus",
];

const basicStatLabels: Record<string, string> = {
  fgm: "FGM",
  fga: "FGA",
  "fg%": "FG%",
  tpm: "3PM",
  tpa: "3PA",
  "tp%": "3P%",
  ftm: "FTM",
  fta: "FTA",
  "ft%": "FT%",
  oreb: "OREB",
  dreb: "DREB",
  reb: "REB",
  ast: "AST",
  stl: "STL",
  blk: "BLK",
  tov: "TOV",
  pf: "PF",
  pts: "PTS",
  plusMinus: "+/-",
};

interface PlayerStats {
  fgm: number;
  fga: number;
  tpm: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  pts: number;
  plusMinus?: number;
  timePlayed?: string;
}

interface TeamStats {
  minutes: number;
  fga: number;
  fta: number;
  tov: number;
  fgm: number;
  reb: number;
}

interface OpponentStats {
  reb: number;
}

function calculateAdvancedStats(
  playerStats: PlayerStats,
  teamStats: TeamStats,
  opponentStats: OpponentStats
): Record<string, number | null | undefined> {
  const {
    fgm,
    fga,
    tpm,
    ftm,
    fta,
    oreb,
    dreb,
    reb,
    ast,
    stl,
    blk,
    tov,
    pf,
    pts,
    plusMinus,
    timePlayed,
  } = playerStats;

  const minutesPlayed = parseTimeToMinutes(timePlayed || "0:00");
  const teamMinutes = teamStats.minutes;
  const teamFGA = teamStats.fga;
  const teamFTA = teamStats.fta;
  const teamTOV = teamStats.tov;
  const teamFGM = teamStats.fgm;
  const teamREB = teamStats.reb;
  const opponentREB = opponentStats.reb;

  const usgNumerator = (fga + 0.44 * fta + tov) * (teamMinutes / 5);
  const usgDenominator = minutesPlayed * (teamFGA + 0.44 * teamFTA + teamTOV);
  const usg = usgDenominator ? (100 * usgNumerator) / usgDenominator : null;

  const tsDenominator = 2 * (fga + 0.44 * fta);
  const ts = tsDenominator ? (100 * pts) / tsDenominator : null;

  const efg = fga ? (100 * (fgm + 0.5 * tpm)) / fga : null;

  const astNumerator = ast * (teamMinutes / 5);
  const astDenominator = minutesPlayed * (teamFGM - fgm);
  const astPct = astDenominator ? (100 * astNumerator) / astDenominator : null;

  const totalAvailableREB = teamREB + opponentREB;
  const rebPct = totalAvailableREB
    ? (100 * reb * (teamMinutes / 5)) / (minutesPlayed * totalAvailableREB)
    : null;

  const tovDenominator = fga + 0.44 * fta + tov;
  const tovPct = tovDenominator ? (100 * tov) / tovDenominator : null;

  const ftr = fga ? fta / fga : null;
  const pps = fga ? pts / fga : null;

  const gameScore =
    pts +
    0.4 * fgm -
    0.7 * fga -
    0.4 * (fta - ftm) +
    0.7 * oreb +
    0.3 * dreb +
    stl +
    0.7 * ast +
    0.7 * blk -
    0.4 * pf -
    tov;

  return {
    usgPct: round(usg),
    tsPct: round(ts),
    efgPct: round(efg),
    astPct: round(astPct),
    rebPct: round(rebPct),
    tovPct: round(tovPct),
    ftr: round(ftr),
    pps: round(pps),
    gameScore: round(gameScore),
    plusMinus,
  };
}

function parseTimeToMinutes(timeStr: string): number {
  const [min, sec] = (timeStr || "0:00").split(":").map(Number);
  return min + sec / 60;
}

function round(num: number | null): number | null {
  return num !== null && !isNaN(num) ? Math.round(num * 100) / 100 : null;
}

function getStatColorZ(value: number, mean: number, stdDev: number): string {
  if (value === null || isNaN(value)) return "transparent";
  const z = (value - mean) / stdDev;

  if (z >= 2) return "rgba(0, 128, 0, 0.35)";
  if (z >= 1.5) return "rgba(0, 160, 0, 0.25)";
  if (z >= 0.75) return "rgba(0, 200, 0, 0.15)";
  if (z <= -2) return "rgba(200, 0, 0, 0.35)";
  if (z <= -1.5) return "rgba(220, 50, 0, 0.25)";
  if (z <= -0.75) return "rgba(240, 100, 0, 0.15)";

  return "transparent";
}

export default function PlayerGameLogTable({ gameLogs }: Props) {
  const [statView, setStatView] = useState<"advanced" | "basic">("basic");

  const processedLogs = useMemo(() => {
    return gameLogs.map((log) => {
      const playerStats: PlayerStats = {
        fgm: Number(log.fgm),
        fga: Number(log.fga),
        tpm: Number(log.tpm),
        ftm: Number(log.ftm),
        fta: Number(log.fta),
        oreb: Number(log.oreb),
        dreb: Number(log.dreb),
        reb: Number(log.reb),
        ast: Number(log.ast),
        stl: Number(log.stl),
        blk: Number(log.blk),
        tov: Number(log.tov),
        pf: Number(log.pf),
        pts: Number(log.pts),
        plusMinus:
          typeof log.plusMinus === "number" ? log.plusMinus : undefined,
        timePlayed:
          typeof log.timePlayed === "string" ? log.timePlayed : "0:00",
      };

      const teamStats: TeamStats = {
        minutes: 200,
        fga: 60,
        fta: 20,
        tov: 12,
        fgm: 25,
        reb: 35,
      };

      const opponentStats: OpponentStats = {
        reb: 38,
      };

      return {
        ...log,
        ...calculateAdvancedStats(playerStats, teamStats, opponentStats),
      };
    });
  }, [gameLogs]);

  const statDistributions = useMemo(() => {
    const stats: Record<string, { mean: number; stdDev: number }> = {};
    const allKeys = [...statKeys, ...basicStatKeys];

    allKeys.forEach((key) => {
      const values = processedLogs
        .map((log) => log[key])
        .filter((v): v is number => typeof v === "number");

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          values.length
      );

      stats[key] = { mean, stdDev };
    });

    return stats;
  }, [processedLogs]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Game Log – {statView === "advanced" ? "Advanced" : "Basic"} Stats
      </Typography>

      <ToggleButtonGroup
        value={statView}
        exclusive
        onChange={(_, val) => val && setStatView(val)}
        size="small"
        sx={{ mb: 2 }}
        className="rounded-xl shadow-xl border border-[#CBD5E1] bg-[#F8FAFC]"
      >
        <ToggleButton value="basic">Basic Stats</ToggleButton>
        <ToggleButton value="advanced">Advanced Stats</ToggleButton>
      </ToggleButtonGroup>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Opponent</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>MIN</TableCell>
              {(statView === "advanced" ? statKeys : basicStatKeys).map(
                (key) => (
                  <TableCell key={key} align="right">
                    {
                      (statView === "advanced" ? statLabels : basicStatLabels)[
                        key
                      ]
                    }
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {new Date(log.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>{log.opponent ?? "-"}</TableCell>
                <TableCell>{log.result ?? "-"}</TableCell>
                <TableCell>{log.timePlayed ?? "-"}</TableCell>
                {(statView === "advanced" ? statKeys : basicStatKeys).map(
                  (key) => {
                    const value = log[key];
                    const dist = statDistributions[key];

                    const bgColor =
                      statView === "advanced" &&
                      typeof value === "number" &&
                      dist
                        ? getStatColorZ(value, dist.mean, dist.stdDev)
                        : "transparent";

                    return (
                      <TableCell
                        key={key}
                        align="right"
                        style={{ backgroundColor: bgColor, color: "#111" }}
                      >
                        {typeof value === "number"
                          ? value.toFixed(1)
                          : typeof value === "string"
                            ? value
                            : "-"}
                      </TableCell>
                    );
                  }
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
