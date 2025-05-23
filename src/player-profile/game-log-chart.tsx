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
} from "@mui/material";
import { useMemo } from "react";

type GameLog = {
  date: string;
  opponent?: string;
  result?: string;
  timePlayed?: string;
  pts?: number;
  [key: string]: any;
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

const statLabels: { [key: string]: string } = {
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

function calculateAdvancedStats(
  playerStats: any,
  teamStats: any,
  opponentStats: any
) {
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

function parseTimeToMinutes(timeStr: string) {
  const [min, sec] = (timeStr || "0:00").split(":").map(Number);
  return min + sec / 60;
}

function round(num: number | null) {
  return num !== null && !isNaN(num) ? Math.round(num * 100) / 100 : null;
}

export default function PlayerGameLogTable({ gameLogs }: Props) {
  const processedLogs = useMemo(() => {
    return gameLogs.map((log) => {
      const teamStats = {
        minutes: 200,
        fga: 60,
        fta: 20,
        tov: 12,
        fgm: 25,
        reb: 35,
      };

      const opponentStats = {
        reb: 38,
      };

      return {
        ...log,
        ...calculateAdvancedStats(log, teamStats, opponentStats),
      };
    });
  }, [gameLogs]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Game Log – Advanced Stats
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Opponent</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>MIN</TableCell>
              {statKeys.map((key) => (
                <TableCell key={key} align="right">
                  {statLabels[key]}
                </TableCell>
              ))}
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
                {statKeys.map((key) => (
                  <TableCell key={key} align="right">
                    {log[key] !== undefined && log[key] !== null
                      ? log[key].toFixed(1)
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
