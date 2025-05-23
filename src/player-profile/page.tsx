import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useState, useMemo } from "react";
import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";
import {
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import PlayerGameLogTable from "./game-log-chart";
import PlayerSeasonStatsTable from "./PlayerSeasonStatsTable";
import PlayerSeasonStatsTable from "./PlayerSeasonStatsTable";

export default function PlayerProfile() {
  const { name } = useParams();
  const player = bio.find((p) => p.name === decodeURIComponent(name || ""));
  const [view, setView] = useState<"season" | "game">("season");

  if (!player) return <div>Player not found</div>;

  const seasonStats = seasonLogs.find((s) => s.playerId === player.playerId);
  const playerGameLogs = game_logs.filter((g) => g.playerId === player.playerId);

  const { means, stdDevs } = useMemo(() => {
    const allStats = seasonLogs.filter((s) => s !== null);
    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    Object.keys(allStats[0] || {}).forEach((key) => {
      if (key === "playerId" || key === "age") return;

      const values = allStats
        .map((s) => s[key])
        .filter((v): v is number => v !== null);

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      means[key] = mean;

      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      stdDevs[key] = Math.sqrt(variance);
    });

    return { means, stdDevs };
  }, []);
  const { means, stdDevs } = useMemo(() => {
    const allStats = seasonLogs.filter((s) => s !== null);
    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    Object.keys(allStats[0] || {}).forEach((key) => {
      if (key === "playerId" || key === "age") return;

      const values = allStats
        .map((s) => s[key])
        .filter((v): v is number => v !== null);

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      means[key] = mean;

      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      stdDevs[key] = Math.sqrt(variance);
    });

    return { means, stdDevs };
  }, []);

  return (
    <Box className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      <Box className="max-w-7xl mx-auto p-6">
        {/* Player Header */}
        <Paper
          elevation={3}
          className="mb-8 overflow-hidden bg-gradient-to-r from-[#1e293b] to-[#334155]"
        >
          <Box className="p-6 flex flex-col md:flex-row gap-6 items-center">
            {/* Player Image */}
            {player.photoUrl && (
              <Box
                component="img"
                src={player.photoUrl}
                alt={`${player.name} headshot`}
                className="w-48 h-48 md:w-64 md:h-64 rounded-xl object-cover shadow-xl"
              />
            )}

            {/* Player Info */}
            <Box className="flex-1 text-center md:text-left">
              <Typography
                variant="h3"
                className="font-bold text-white mb-2 tracking-tight"
              >
                {player.name}
              </Typography>
              <Typography variant="h6" className="text-gray-300 mb-4">
                {player.currentTeam} • {player.league}
              </Typography>
              <Box className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Height
                  </Typography>
                  <Typography>
                    {Math.floor(player.height / 12)}'{player.height % 12}"
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Weight
                  </Typography>
                  <Typography>{player.weight} lbs</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Nationality
                  </Typography>
                  <Typography>{player.nationality}</Typography>
                </div>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Stats Toggle */}
        <Box className="mb-6">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            className="bg-white rounded-lg shadow"
          >
            <ToggleButton
              value="season"
              className={`px-6 py-2 ${
                view === "season"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Season Stats
            </ToggleButton>
            <ToggleButton
              value="game"
              className={`px-6 py-2 ${
                view === "game"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Game Log
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {/* Stats Toggle */}
        <Box className="mb-6">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            className="bg-white rounded-lg shadow"
          >
            <ToggleButton
              value="season"
              className={`px-6 py-2 ${
                view === "season"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Season Stats
            </ToggleButton>
            <ToggleButton
              value="game"
              className={`px-6 py-2 ${
                view === "game"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Game Log
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Stats Display */}
        <Box className="bg-white rounded-xl shadow-lg p-6">
          {view === "season" ? (
            seasonStats && (
              <PlayerSeasonStatsTable
                stats={seasonStats}
                means={means}
                stdDevs={stdDevs}
              />
            )
          ) : (
            <PlayerGameLogTable gameLogs={playerGameLogs} />
          )}
        </Box>
      </Box>
        {/* Stats Display */}
        <Box className="bg-white rounded-xl shadow-lg p-6">
          {view === "season" ? (
            seasonStats && (
              <PlayerSeasonStatsTable
                stats={seasonStats}
                means={means}
                stdDevs={stdDevs}
              />
            )
          ) : (
            <PlayerGameLogTable gameLogs={playerGameLogs} />
          )}
        </Box>
      </Box>
    </Box>
  );
}