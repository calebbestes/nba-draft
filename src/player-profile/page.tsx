import { useParams } from "react-router-dom";
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

export default function PlayerProfile() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const player = bio.find((p) => p.name === decodedName);

  const [view, setView] = useState<"season" | "game">("season");

  const seasonStats = useMemo(() => {
    return player
      ? seasonLogs.find((s) => s.playerId === player.playerId)
      : null;
  }, [player]);

  const playerGameLogs = useMemo(() => {
    return player
      ? game_logs.filter((g) => g.playerId === player.playerId)
      : [];
  }, [player]);

  const { means, stdDevs } = useMemo(() => {
    const allStats = seasonLogs.filter((s) => s !== null);
    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    if (!allStats.length) return { means, stdDevs };

    Object.keys(allStats[0] || {}).forEach((key) => {
      if (key === "playerId" || key === "age") return;

      const values = allStats
        .map((s) => s[key as keyof typeof s])
        .filter((v): v is number => v !== null);

      if (!values.length) return;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      means[key] = mean;

      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      stdDevs[key] = Math.sqrt(variance);
    });

    return { means, stdDevs };
  }, []);

  if (!player) return <div>Player not found</div>;
  return (
    <Box className="min-h-screen bg-[#0C2340] text-white">
      <Box className="max-w-7xl mx-auto p-6">
        <Paper elevation={3} className="mb-8 overflow-hidden bg-[#1D2D50]">
          <Box className="p-6 flex flex-col md:flex-row gap-6 items-center">
            {player.photoUrl && (
              <Box
                component="img"
                src={player.photoUrl}
                alt={`${player.name} headshot`}
                className="w-48 h-48 md:w-64 md:h-64 rounded-xl object-cover shadow-xl"
              />
            )}
            <Box className="flex-1 text-center md:text-left">
              <Typography
                variant="h3"
                className="font-bold text-white mb-2 tracking-tight"
              >
                {player.name}
              </Typography>
              <Typography variant="h6" className="text-[#A0AEC0] mb-4">
                {player.currentTeam} • {player.league}
              </Typography>
              <Box className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Height
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {Math.floor(player.height / 12)}'{player.height % 12}"
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Weight
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.weight} lbs
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Nationality
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.nationality}
                  </Typography>
                </div>
              </Box>
            </Box>
          </Box>
          <Box className="mt-4">
            <Typography variant="h6" className="text-[#A0AEC0] mb-2">
              Highlights
            </Typography>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                player.name + " highlights"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-[#00A3E0] hover:bg-[#007DC5] text-white font-bold py-2 px-4 rounded shadow"
            >
              Watch Highlights
            </a>
          </Box>
        </Paper>

        <Box className="mb-6">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            className="rounded-xl shadow-xl border border-[#CBD5E1] bg-[#F8FAFC]"
          >
            <ToggleButton
              value="season"
              className={`px-6 py-2 font-semibold transition-all duration-200 border border-[#CBD5E1] ${
                view === "season"
                  ? "bg-white text-[#0C2340]"
                  : "bg-[#F1F5F9] text-[#0C2340] hover:bg-white"
              }`}
            >
              Season Stats
            </ToggleButton>
            <ToggleButton
              value="game"
              className={`px-6 py-2 font-semibold transition-all duration-200 border border-[#CBD5E1] ${
                view === "game"
                  ? "bg-white text-[#0C2340]"
                  : "bg-[#F1F5F9] text-[#0C2340] hover:bg-white"
              }`}
            >
              Game Log
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box className="bg-[#1D2D50] text-white rounded-xl shadow-lg p-6">
          {view === "season" ? (
            seasonStats && (
              <PlayerSeasonStatsTable
                stats={
                  Object.fromEntries(
                    Object.entries(seasonStats).filter(
                      ([, value]) => typeof value === "number"
                    )
                  ) as Record<string, number | null>
                }
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
