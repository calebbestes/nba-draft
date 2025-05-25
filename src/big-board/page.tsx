import { MenuItem, Select, FormControl } from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { useEffect, useMemo, useState } from "react";
import { type Specialty } from "../utils/get-player-specialties";
import { getSpecialtyMap } from "../utils/get-player-specialties";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import PlayerGrid from "./player-grid";

const rankingSources = [
  "Average Rank",
  "ESPN Rank",
  "Sam Vecenie Rank",
  "Kevin O'Connor Rank",
  "Kyle Boone Rank",
  "Gary Parrish Rank",
];

export default function BigBoard() {
  const [starred, setStarred] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("starredPlayers");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [sortKey, setSortKey] = useState(() => {
    return localStorage.getItem("sortKey") || "Average Rank";
  });

  useEffect(() => {
    localStorage.setItem("sortKey", sortKey);
  }, [sortKey]);

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });

  useEffect(() => {
    localStorage.setItem("searchQuery", searchQuery);
  }, [searchQuery]);
  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty>(() => {
    return (localStorage.getItem("specialtyFilter") as Specialty) || "All";
  });

  useEffect(() => {
    localStorage.setItem("specialtyFilter", specialtyFilter);
  }, [specialtyFilter]);

  function toggleStar(playerId: number) {
    setStarred((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      localStorage.setItem("starredPlayers", JSON.stringify([...newSet]));
      return newSet;
    });
  }

  const avgRankMap = useMemo(() => {
    const playerMeans = bio.map((player) => {
      const ranking = scoutRankings.find((r) => r.playerId === player.playerId);
      if (!ranking) return { playerId: player.playerId, mean: Infinity };

      const values = Object.entries(ranking)
        .filter(([key, val]) => key !== "playerId" && typeof val === "number")
        .map(([, val]) => val as number);

      const mean = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : Infinity;
      return { playerId: player.playerId, mean };
    });

    playerMeans.sort((a, b) => a.mean - b.mean);

    const map: Record<number, number> = {};
    playerMeans.forEach((p, index) => {
      map[p.playerId] = index + 1;
    });

    return map;
  }, []);

  const specialtyMap = useMemo(
    () => getSpecialtyMap(bio.map((p) => ({ playerId: p.playerId }))),
    []
  );

  const sortedPlayers = useMemo(() => {
    return [...bio]
      .filter((player) => {
        const specialty = specialtyMap[player.playerId] ?? "Pure Scorer";
        const matchesSpecialty =
          specialtyFilter === "All" ||
          (specialtyFilter === "Starred"
            ? starred.has(player.playerId)
            : specialty === specialtyFilter);

        const matchesSearch = player.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return matchesSpecialty && matchesSearch;
      })
      .sort((a, b) => {
        const rankA = getRank(a.playerId, sortKey, avgRankMap);
        const rankB = getRank(b.playerId, sortKey, avgRankMap);
        return (rankA ?? Infinity) - (rankB ?? Infinity);
      });
  }, [
    sortKey,
    avgRankMap,
    specialtyFilter,
    specialtyMap,
    starred,
    searchQuery,
  ]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0C2340] text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-full sm:w-72">
            <div className="w-full rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm">
              <div className="mb-1 text-sm font-semibold text-[#B8C4CA]">
                Search by Name
              </div>
              <input
                type="text"
                placeholder="e.g. Brian Scalabrine"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/90 text-[#002B5E] placeholder-[#94A3B8] rounded-xl shadow-sm border border-[#00A3E0] px-4 py-2.5 font-semibold focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="w-70 rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm flex flex-col">
            <FormControl sx={{ width: "100%" }}>
              <div className="grid grid-cols-[60px_1fr] items-center gap-2 h-8">
                <label
                  htmlFor="specialty-select"
                  className="text-sm font-semibold text-[#B8C4CA]"
                >
                  Filter:
                </label>
                <Select
                  id="specialty-select"
                  size="small"
                  value={specialtyFilter}
                  onChange={(e) =>
                    setSpecialtyFilter(e.target.value as Specialty)
                  }
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    px: 1.25,
                    py: 0.5,
                    height: "1.9rem",
                    minHeight: "unset",
                    color: "#002B5E",
                    border: "1px solid #00A3E0", // ✅ consistent border
                    borderRadius: "0.75rem", // rounded-xl
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "& .MuiSelect-icon": {
                      color: "#00538C",
                    },
                    "&:hover": {
                      borderColor: "#B8C4CA",
                    },
                  }}
                >
                  {[
                    "All",
                    "Starred",
                    "Versatile",
                    "Stretch Big",
                    "Three and D",
                    "Pure Scorer",
                    "Utility Big",
                    "Potential",
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </FormControl>

            <FormControl sx={{ width: "100%" }}>
              <div className="grid grid-cols-[60px_1fr] items-center gap-2 h-8">
                <label
                  htmlFor="sort-select"
                  className="text-sm font-semibold text-[#B8C4CA]"
                >
                  Sort by:
                </label>
                <Select
                  id="sort-select"
                  size="small"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-[#00538C]"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    px: 1.25,
                    py: 0.5,
                    height: "1.9rem",
                    minHeight: "unset",
                    color: "#002B5E",
                    border: "1px solid #00A3E0", // ✅ consistent border
                    borderRadius: "0.75rem", // rounded-xl
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "& .MuiSelect-icon": {
                      color: "#00538C",
                    },
                    "&:hover": {
                      borderColor: "#B8C4CA",
                    },
                  }}
                >
                  {rankingSources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </FormControl>
          </div>

          {starred.size > 0 && (
            <div className="ml-auto">
              <button
                disabled={starred.size > 5}
                onClick={() => {
                  const ids = [...starred].slice(0, 5);
                  navigate(`/compare?players=${ids.join(",")}`);
                }}
                className={`px-8 py-3 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-in-out
                  ${
                    starred.size > 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#007A33] to-[#00B140] hover:from-[#006326] hover:to-[#009933] shadow-xl hover:shadow-2xl"
                  }
                `}
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
              >
                Compare Starred Players
              </button>
            </div>
          )}
        </div>
      </div>

      <PlayerGrid
        sortedPlayers={sortedPlayers}
        sortKey={sortKey}
        starred={starred}
        toggleStar={toggleStar}
        avgRankMap={avgRankMap}
      />
      <Footer />
    </div>
  );
}

function getRank(
  playerId: number,
  source: string,
  avgRankMap?: Record<number, number>
): number | null {
  if (source === "Average Rank" && avgRankMap) {
    return avgRankMap[playerId] ?? null;
  }

  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return null;

  const value = (ranking as Record<string, number | null>)[source];
  return typeof value === "number" ? value : null;
}
