import { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { players } from "../data/players";

import StarButton from "../components/star";
import Footer from "../components/footer";

export default function PlayerComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialIds = useMemo(() => {
    const param = searchParams.get("players");
    return param ? decodeURIComponent(param).split(",") : [];
  }, [searchParams]);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(initialIds);

  const playerOptions = useMemo(
    () => players.map((p) => ({ label: p.name, id: p.name })),
    []
  );

  const handlePlayerSelect = (playerName: string | null) => {
    if (!playerName) return;
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : prev.length >= 6
          ? [...prev.slice(1), playerName]
          : [...prev, playerName]
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

        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Player Selector */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <Typography variant="h6" className="text-white mb-4">
              Add Players (max 6)
            </Typography>
            <Autocomplete
              options={playerOptions}
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
        </div>

        {/* Player Panels */}
        {selectedPlayers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {selectedPlayers.map((playerName) => {
              const player = players.find((p) => p.name === playerName);
              if (!player) return null;

              return (
                <Paper
                  key={playerName}
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
                            prev.filter((name) => name !== playerName)
                          )
                        }
                      />
                    </div>
                    <Typography variant="body2" className="text-[#A0AEC0] mt-1">
                      {player.team} • {player.conference}
                    </Typography>
                  </div>

                  <div
                    className="p-4 max-h-[600px] overflow-auto"
                    ref={(el) => {
                      scrollRefs.current[playerName.length] = el; // Simple numeric key
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">Position</Typography>
                        <Typography className="text-white font-medium">{player.position}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">Height</Typography>
                        <Typography className="text-white font-medium">{player.height}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">Weight</Typography>
                        <Typography className="text-white font-medium">{player.weight}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">Class Year</Typography>
                        <Typography className="text-white font-medium">{player.class_year}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">Hometown</Typography>
                        <Typography className="text-white font-medium">{player.hometown}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-[#A0AEC0]">High School</Typography>
                        <Typography className="text-white font-medium">{player.high_school}</Typography>
                      </div>
                    </div>
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
