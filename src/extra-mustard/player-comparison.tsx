import { useState, useMemo, useEffect, useRef } from "react";
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";

import PlayerMeasurements from "../player-profile/player-measurements";
import PlayerGameLogTable from "../player-profile/game-log-chart";
import PlayerSeasonStatsTable, {
  calculateAdvancedSeasonStats,
} from "../player-profile/PlayerSeasonStatsTable";

import StarButton from "../components/star";
import Footer from "../components/footer";

const COMPARISON_OPTIONS = [
  "Measurements",
  "Advanced Trends",
  "Season Basic Stats",
  "Season Advanced Stats",
];

export default function PlayerComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialIds = useMemo(() => {
    const param = searchParams.get("players");
    return param ? param.split(",").map(Number) : [];
  }, [searchParams]);

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>(initialIds);
  const [comparisonMode, setComparisonMode] = useState(COMPARISON_OPTIONS[1]);

  const players = useMemo(
    () => bio.map((p) => ({ label: p.name, id: p.playerId })),
    []
  );

  const comparisonStats = useMemo(
    () => seasonLogs.filter((s) => selectedPlayers.includes(s.playerId)),
    [selectedPlayers]
  );

  const { means: peerMeans, stdDevs: peerStdDevs } = useMemo(() => {
    const keys = [
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
      "USG%",
      "Stock40",
      "AST/TOV",
    ];

    const valuesByKey: Record<string, number[]> = {};
    comparisonStats.forEach((row) => {
      const adv = calculateAdvancedSeasonStats(row);
      keys.forEach((key) => {
        const val = adv[key];
        if (typeof val === "number" && !isNaN(val)) {
          (valuesByKey[key] ||= []).push(val);
        }
      });
    });

    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    keys.forEach((key) => {
      const vals = valuesByKey[key] || [];
      if (vals.length) {
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        means[key] = mean;
        stdDevs[key] = Math.sqrt(
          vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length
        );
      }
    });

    return { means, stdDevs };
  }, [comparisonStats]);

  const handlePlayerSelect = (playerId: number | null) => {
    if (!playerId) return;
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : prev.length >= 6
          ? [...prev.slice(1), playerId]
          : [...prev, playerId]
    );
  };

  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    const refs = scrollRefs.current;
    let isSyncing = false;

    const handleScroll = (sourceId: number) => {
      if (isSyncing || !refs[sourceId]) return;
      isSyncing = true;
      const { scrollTop, scrollLeft } = refs[sourceId]!;
      Object.entries(refs).forEach(([id, ref]) => {
        if (Number(id) !== sourceId && ref) {
          ref.scrollTop = scrollTop;
          ref.scrollLeft = scrollLeft;
        }
      });
      isSyncing = false;
    };

    const listeners = Object.entries(refs)
      .filter(([, ref]) => ref)
      .map(([id, ref]) => {
        const fn = () => handleScroll(Number(id));
        ref!.addEventListener("scroll", fn);
        return { ref: ref!, fn };
      });

    return () => {
      listeners.forEach(({ ref, fn }) => ref.removeEventListener("scroll", fn));
    };
  }, [selectedPlayers.length]);

  return (
    <Box className="min-h-screen bg-[#0C2340]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player Selector */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <Typography variant="h6" className="text-white mb-4">
              Add Players (max 6)
            </Typography>
            <Autocomplete
              options={players}
              getOptionLabel={(option) => option.label}
              onChange={(_, value) => handlePlayerSelect(value?.id ?? null)}
              renderOption={(props, option) => {
                const isSelected = selectedPlayers.includes(option.id);
                return (
                  <li {...props} className="flex justify-between w-full px-2">
                    <span>{option.label}</span>
                    {isSelected && (
                      <span className="text-green-400 font-bold ml-2">✓</span>
                    )}
                  </li>
                );
              }}
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
                    "& .MuiInputBase-input": { color: "white" },
                  }}
                />
              )}
            />
          </div>

          {/* Comparison Mode Selector */}
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
                  "& .MuiSelect-icon": { color: "white" },
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                }}
              >
                {COMPARISON_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === "Advanced Trends" ? "Game By Game" : option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Player Panels */}
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
                    <Typography variant="body2" className="text-[#A0AEC0] mt-1">
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
                    {(comparisonMode === "Season Basic Stats" ||
                      comparisonMode === "Season Advanced Stats") && (
                      <PlayerSeasonStatsTable
                        stats={seasonLogs.filter(
                          (s) => s.playerId === playerId
                        )}
                        means={peerMeans}
                        stdDevs={peerStdDevs}
                        type={
                          comparisonMode === "Season Advanced Stats"
                            ? "advanced"
                            : "basic"
                        }
                        compareAgainstClass={false}
                      />
                    )}
                  </div>
                </Paper>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </Box>
  );
}
