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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";

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

const statLabels: Record<string, number | string | null | undefined> = {
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

export default function PlayerGameLogTable({ gameLogs }: Props) {
  const [statView, setStatView] = useState<"advanced" | "basic">("basic");
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: {
      payload: {
        isHome: number;
        homeTeamPts: number;
        visitorTeamPts: number;
        opponent: string;
        [key: string]: unknown;
      };
      value: number;
    }[];
  }) => {
    if (active && payload && payload.length > 0) {
      const game = payload[0].payload;
      const teamScore = game.isHome
        ? (game.homeTeamPts ?? 0)
        : (game.visitorTeamPts ?? 0);

      const opponentScore = game.isHome
        ? (game.visitorTeamPts ?? 0)
        : (game.homeTeamPts ?? 0);

      const resultLabel = teamScore > opponentScore ? "W" : "L";

      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            backgroundColor: "#1D2D50",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">
            <strong>Result:</strong> {resultLabel} {teamScore}–{opponentScore}
          </Typography>
          {game.opponent && (
            <Typography variant="body2">
              <strong>Opponent:</strong> {game.opponent}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Stat:</strong>{" "}
            {selectedMetric.includes("Pct") || selectedMetric.includes("%")
              ? payload[0].value.toFixed(1)
              : Math.round(payload[0].value)}
          </Typography>
        </Paper>
      );
    }

    return null;
  };
  const processedLogs = useMemo(() => {
    return gameLogs
      .slice() // avoid mutating original array
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((log) => {
        const playerStats: PlayerStats = {
          fgm: Number(log.fgm) || 0,
          fga: Number(log.fga) || 0,
          tpm: Number(log.tpm) || 0,
          ftm: Number(log.ftm) || 0,
          fta: Number(log.fta) || 0,
          oreb: Number(log.oreb) || 0,
          dreb: Number(log.dreb) || 0,
          reb: Number(log.reb) || 0,
          ast: Number(log.ast) || 0,
          stl: Number(log.stl) || 0,
          blk: Number(log.blk) || 0,
          tov: Number(log.tov) || 0,
          pf: Number(log.pf) || 0,
          pts: Number(log.pts) || 0,
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

        const rawHomeScore =
          typeof log.homeTeamPts === "number" ? log.homeTeamPts : 0;
        const rawVisitorScore =
          typeof log.visitorTeamPts === "number" ? log.visitorTeamPts : 0;

        const isHome = log.isHome === 1;
        const teamScore = isHome ? rawHomeScore : rawVisitorScore;
        const opponentScore = isHome ? rawVisitorScore : rawHomeScore;
        const result = teamScore > opponentScore ? "W" : "L";

        return {
          ...log,
          result,
          ...calculateAdvancedStats(playerStats, teamStats, opponentStats),
        };
      });
  }, [gameLogs]);

  const [selectedMetric, setSelectedMetric] = useState<string>("gameScore");

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
        <ToggleButton value="advanced">Advanced Stats Trends</ToggleButton>
      </ToggleButtonGroup>

      {statView === "basic" ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                >
                  Date
                </TableCell>
                <TableCell
                  align="center"
                  className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                >
                  Opponent
                </TableCell>
                <TableCell
                  align="center"
                  className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                >
                  Result
                </TableCell>
                <TableCell
                  align="center"
                  className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                >
                  MIN
                </TableCell>
                {basicStatKeys.map((key) => (
                  <TableCell
                    key={key}
                    align="center"
                    className="text-[#B8C4CA] font-semibold text-sm py-4 bg-[#0C2340]/40 border-b border-white/10"
                  >
                    {basicStatLabels[key]}
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
                  <TableCell>
                    {typeof log.timePlayed === "string"
                      ? log.timePlayed.split(":")[0]
                      : "-"}
                  </TableCell>
                  {basicStatKeys.map((key) => {
                    const value = (
                      log as Record<string, number | string | null | undefined>
                    )[key];
                    return (
                      <TableCell
                        key={key}
                        align="right"
                        style={{ color: "#111" }}
                      >
                        {typeof value === "number"
                          ? Math.round(value)
                          : (value ?? "-")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Box className="mb-4">
            <FormControl variant="outlined" size="small">
              <InputLabel id="metric-label">Metric</InputLabel>
              <Select
                labelId="metric-label"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                label="Metric"
                sx={{
                  minWidth: 200,
                  backgroundColor: "white",
                  color: "#002B5E",
                  fontWeight: 600,
                }}
              >
                {statKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {statLabels[key] || key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedLogs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#FFFFFF"
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
                tickFormatter={(dateStr) =>
                  new Date(dateStr).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                stroke="#FFFFFF"
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
              />

              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#00A3E0"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Box>
  );
}
