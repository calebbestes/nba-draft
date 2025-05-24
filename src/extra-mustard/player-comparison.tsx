import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";
import PlayerMeasurements from "../player-profile/player-measurements";
import PlayerGameLogTable from "../player-profile/game-log-chart";
import PlayerSeasonStatsTable from "../player-profile/PlayerSeasonStatsTable";
import StarButton from "../components/star";
import Footer from "../components/footer";

export default function PlayerComparison() {
  const [searchParams] = useSearchParams();
  const initialIds = useMemo(() => {
    const param = searchParams.get("players");
    return param ? param.split(",").map((id) => parseInt(id)) : [];
  }, [searchParams]);

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>(initialIds);
  const [comparisonMode, setComparisonMode] = useState("Measurements");

  const players = useMemo(
    () =>
      bio.map((player) => ({
        label: player.name,
        id: player.playerId,
      })),
    []
  );

  const handlePlayerSelect = (playerId: number | null) => {
    if (!playerId) return;

    setSelectedPlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), playerId];
      }
      return [...prev, playerId];
    });
  };

  const { means, stdDevs } = useMemo(() => {
    const filteredStats = seasonLogs.filter((s) => {
      const gp = Number(s.GP);
      return !isNaN(gp) && gp >= 15;
    });

    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    if (!filteredStats.length) return { means, stdDevs };

    Object.keys(filteredStats[0] || {}).forEach((key) => {
      if (key === "playerId" || key === "age") return;

      const values = filteredStats
        .map((s) => s[key as keyof typeof s])
        .filter((v): v is number => v !== null && typeof v === "number");

      if (!values.length) return;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      means[key] = mean;

      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      stdDevs[key] = Math.sqrt(variance);
    });

    return { means, stdDevs };
  }, []);

  return (
    <Box className="min-h-screen bg-[#0C2340] text-white p-6">
      <Typography
        variant="h4"
        className="text-center mb-8 font-bold text-[#00A3E0]"
      >
        Player Comparison
      </Typography>

      <Box className="max-w-xl mx-auto mb-6">
        <Autocomplete
          options={players}
          getOptionLabel={(option) => option.label}
          onChange={(_, value) => handlePlayerSelect(value?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add Player (max 5)"
              variant="outlined"
              className="bg-black/10 rounded-xl"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00A3E0",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
          )}
        />
      </Box>

      <FormControl sx={{ mb: 6, minWidth: 240 }}>
        <Select
          value={comparisonMode}
          onChange={(e) => setComparisonMode(e.target.value)}
          sx={{
            backgroundColor: "white",
            color: "#002B5E",
            fontWeight: 600,
            borderRadius: "8px",
          }}
        >
          <MenuItem value="Measurements">Measurements</MenuItem>
          <MenuItem value="Advanced Trends">Game By Game</MenuItem>
          <MenuItem value="Season Basic Stats">Season Basic Stats</MenuItem>
          <MenuItem value="Season Advanced Stats">
            Season Advanced Stats
          </MenuItem>
        </Select>
      </FormControl>

      {selectedPlayers.length > 0 && (
        <Box className="flex flex-col gap-6">
          {selectedPlayers.map((playerId) => (
            <Paper
              key={playerId}
              className="bg-white/5 border border-white/20 p-6 rounded-xl"
            >
              <Box className="flex justify-between items-center mb-2">
                <Typography variant="h6" className="text-[#00A3E0]">
                  {bio.find((p) => p.playerId === playerId)?.name}
                </Typography>
                <StarButton
                  isStarred={true}
                  onToggle={() =>
                    setSelectedPlayers((prev) =>
                      prev.filter((id) => id !== playerId)
                    )
                  }
                />
              </Box>

              {comparisonMode === "Measurements" && (
                <PlayerMeasurements playerId={playerId} />
              )}

              {comparisonMode === "Advanced Trends" && (
                <PlayerGameLogTable
                  gameLogs={game_logs.filter((g) => g.playerId === playerId)}
                />
              )}

              {comparisonMode === "Season Basic Stats" && (
                <PlayerSeasonStatsTable
                  stats={seasonLogs.filter((s) => s.playerId === playerId)}
                  means={means}
                  stdDevs={stdDevs}
                  type="basic"
                />
              )}

              {comparisonMode === "Season Advanced Stats" && (
                <PlayerSeasonStatsTable
                  stats={seasonLogs.filter((s) => s.playerId === playerId)}
                  means={means}
                  stdDevs={stdDevs}
                  type="advanced"
                />
              )}
            </Paper>
          ))}
        </Box>
      )}
      <Footer />
    </Box>
  );
}
