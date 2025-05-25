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
import { Link, useSearchParams } from "react-router-dom";
import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";
import PlayerMeasurements from "../player-profile/player-measurements";
import PlayerGameLogTable from "../player-profile/game-log-chart";
import PlayerSeasonStatsTable from "../player-profile/PlayerSeasonStatsTable";
import StarButton from "../components/star";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

export default function PlayerComparison() {
  const navigate = useNavigate();

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
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    const refs = scrollRefs.current;
    let isSyncing = false;

    const handleScroll = (sourceId: number) => {
      if (isSyncing) return;

      const sourceRef = refs[sourceId];
      if (!sourceRef) return;

      isSyncing = true;
      const { scrollTop, scrollLeft } = sourceRef;

      Object.entries(refs).forEach(([id, ref]) => {
        const numericId = Number(id);
        if (numericId !== sourceId && ref) {
          ref.scrollTop = scrollTop;
          ref.scrollLeft = scrollLeft;
        }
      });

      isSyncing = false;
    };

    const listeners: { ref: HTMLDivElement; fn: () => void }[] = [];

    Object.entries(refs).forEach(([id, ref]) => {
      if (ref) {
        const numericId = Number(id);
        const fn = () => handleScroll(numericId);
        ref.addEventListener("scroll", fn);
        listeners.push({ ref, fn });
      }
    });

    return () => {
      listeners.forEach(({ ref, fn }) => {
        ref.removeEventListener("scroll", fn);
      });
    };
  }, [selectedPlayers.length]);
  return (
    <Box className="min-h-screen bg-[#0C2340]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Typography variant="h4" className="text-white font-bold">
              Player Comparison
            </Typography>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-white bg-[#00A3E0] hover:bg-[#007ab8] px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Big Board
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <Typography variant="h6" className="text-white mb-4">
                Add Players (max 5)
              </Typography>
              <Autocomplete
                options={players}
                getOptionLabel={(option) => option.label}
                onChange={(_, value) => handlePlayerSelect(value?.id ?? null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search for a player..."
                    variant="outlined"
                    className="bg-white/5 rounded-xl"
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
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <Typography variant="h6" className="text-white mb-4">
                Comparison Type
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.value)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    "& .MuiSelect-icon": {
                      color: "white",
                    },
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <MenuItem value="Measurements">Measurements</MenuItem>
                  <MenuItem value="Advanced Trends">Game By Game</MenuItem>
                  <MenuItem value="Season Basic Stats">
                    Season Basic Stats
                  </MenuItem>
                  <MenuItem value="Season Advanced Stats">
                    Season Advanced Stats
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {selectedPlayers.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {selectedPlayers.map((playerId) => {
                const player = bio.find((p) => p.playerId === playerId);
                if (!player) return null;

                return (
                  <Paper
                    key={playerId}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-[#1A365D] to-[#0C2340] border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <Link
                          to={`/player/${encodeURIComponent(player.name)}`}
                          className="text-[#00A3E0] hover:text-[#007ab8] transition-colors"
                        >
                          <Typography variant="h6">{player.name}</Typography>
                        </Link>
                        <StarButton
                          isStarred={true}
                          onToggle={() =>
                            setSelectedPlayers((prev) =>
                              prev.filter((id) => id !== playerId)
                            )
                          }
                        />
                      </div>
                      <Typography
                        variant="body2"
                        className="text-[#A0AEC0] mt-1"
                      >
                        {player.currentTeam} • {player.league}
                      </Typography>
                    </div>

                    <div
                      className="p-4 max-h-[600px] overflow-auto"
                      ref={(el) => {
                        scrollRefs.current[playerId] = el;
                      }}
                    >
                      {comparisonMode === "Measurements" && (
                        <PlayerMeasurements playerId={playerId} />
                      )}
                      {comparisonMode === "Advanced Trends" && (
                        <PlayerGameLogTable
                          gameLogs={game_logs.filter(
                            (g) => g.playerId === playerId
                          )}
                        />
                      )}
                      {comparisonMode === "Season Basic Stats" && (
                        <PlayerSeasonStatsTable
                          stats={seasonLogs.filter(
                            (s) => s.playerId === playerId
                          )}
                          means={means}
                          stdDevs={stdDevs}
                          type="basic"
                        />
                      )}
                      {comparisonMode === "Season Advanced Stats" && (
                        <PlayerSeasonStatsTable
                          stats={seasonLogs.filter(
                            (s) => s.playerId === playerId
                          )}
                          means={means}
                          stdDevs={stdDevs}
                          type="advanced"
                        />
                      )}
                    </div>
                  </Paper>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </Box>
  );
}
