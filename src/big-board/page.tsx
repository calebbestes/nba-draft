import { MenuItem, Tooltip, Select, FormControl } from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  getSpecialtyMap,
  type Specialty,
} from "../utils/get-player-specialties";
import Header from "../components/header";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

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

  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty>(() => {
    return (localStorage.getItem("specialtyFilter") as Specialty) || "All";
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });

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

  function formatHeight(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
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

  const specialtyMap = useMemo(() => getSpecialtyMap(bio), []);

  const sortedPlayers = useMemo(() => {
    return [...bio]
      .filter((player) => {
        const specialty = specialtyMap[player.playerId] ?? "Shot Creator";
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

      <div className="max-w-7xl mx-auto">
        <div className="mt-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
          <FormControl className="w-full sm:w-72">
            <div className="w-full sm:w-72 rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm">
              <div className="mb-1 text-sm font-semibold text-[#B8C4CA]">
                Search by Name
              </div>
              <input
                type="text"
                placeholder="e.g. Brian Scalabrine"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/90 text-[#002B5E] placeholder-[#94A3B8] rounded-xl shadow-sm border border-[#00538C] px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007DC5] w-full"
              />
            </div>
          </FormControl>

          <div className="ml-auto w-70 rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm flex flex-col ">
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
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-[#00538C]"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    px: 1.25,
                    py: 0.5,
                    height: "1.9rem",
                    minHeight: "unset",
                    color: "#002B5E",
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
                    "Stretch Big",
                    "Three and D",
                    "Floor General",
                    "Shot Creator",
                    "Utility Big",
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
        {sortedPlayers.map((player) => {
          const rank = getRank(player.playerId, sortKey, avgRankMap);
          const [minRank, minSource, maxRank, maxSource] = getMinMaxRank(
            player.playerId
          );
          const outlierType = getOutlierType(player.playerId, sortKey);

          return (
            <div
              key={player.playerId}
              className="cursor-pointer transform scale-90 sm:scale-95 md:scale-100"
            >
              <div
                onClick={() =>
                  navigate(`/player/${encodeURIComponent(player.name)}`)
                }
                className="rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-out bg-white/90 backdrop-blur-sm border border-transparent hover:border-[#00A3E0]"
              >
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        toggleStar(player.playerId);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      {starred.has(player.playerId) ? (
                        <StarIcon fontSize="medium" />
                      ) : (
                        <StarBorderIcon fontSize="medium" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 z-10">
                    {typeof rank === "number" && isFinite(rank) && (
                      <Tooltip
                        title={
                          <div className="text-sm leading-tight space-y-1">
                            {Object.entries(
                              scoutRankings.find(
                                (r) => r.playerId === player.playerId
                              ) ?? {}
                            )
                              .filter(
                                ([key, val]) =>
                                  key !== "playerId" && typeof val === "number"
                              )
                              .map(([source, val]) => (
                                <div key={source}>
                                  <strong>{source}:</strong> #{val}
                                </div>
                              ))}
                            {outlierType === "high" && (
                              <div className="text-yellow-300 font-semibold pt-1">
                                ⭐ This scout ranked them significantly higher
                                than others
                              </div>
                            )}
                            {outlierType === "low" && (
                              <div className="text-red-300 font-semibold pt-1">
                                ⚠️ This scout ranked them significantly lower
                                than others
                              </div>
                            )}
                          </div>
                        }
                        arrow
                        placement="right"
                      >
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-full font-extrabold text-lg shadow-md hover:shadow-lg transition cursor-help
      ${
        outlierType === "high"
          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
          : outlierType === "low"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-black hover:bg-gray-900 text-[#C0C0C0]"
      }`}
                        >
                          #{Math.round(rank)}
                        </div>
                      </Tooltip>
                    )}
                  </div>

                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.678 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h2 className="flex items-center justify-between text-white font-bold text-xl">
                      <span>{player.name}</span>
                      <span>{formatHeight(player.height)}</span>
                    </h2>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>{player.currentTeam}</span>
                      <span>{player.homeCountry}</span>
                    </div>
                  </div>
                </div>
                {sortKey === "Average Rank" && (
                  <div className="px-4 py-3">
                    <div className="flex justify-between text-sm font-medium gap-2">
                      {isFinite(minRank) && (
                        <Tooltip title={`Source: ${minSource}`}>
                          <span className="bg-[#002B5E] text-[#B8C4CA] px-2 py-1 rounded w-full text-center text-sm font-medium cursor-help">
                            Highest Rank: {minRank}
                          </span>
                        </Tooltip>
                      )}
                      {isFinite(maxRank) && (
                        <Tooltip title={`Source: ${maxSource}`}>
                          <span className="bg-[#B8C4CA] text-[#002B5E] px-2 py-1 rounded w-full text-center text-sm font-medium cursor-help">
                            Lowest Rank: {maxRank}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

function getMinMaxRank(playerId: number): [number, string, number, string] {
  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return [Infinity, "", Infinity, ""];

  const entries = Object.entries(ranking).filter(
    ([key, val]) => key !== "playerId" && typeof val === "number"
  ) as [string, number][];

  if (!entries.length) return [Infinity, "", Infinity, ""];

  let minEntry = entries[0];
  let maxEntry = entries[0];

  for (const entry of entries) {
    if (entry[1] < minEntry[1]) minEntry = entry;
    if (entry[1] > maxEntry[1]) maxEntry = entry;
  }

  return [minEntry[1], minEntry[0], maxEntry[1], maxEntry[0]];
}

function getOutlierType(
  playerId: number,
  source: string
): "high" | "low" | null {
  if (source === "Average Rank") return null;

  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return null;

  const entries = Object.entries(ranking).filter(
    ([key, val]) => key !== "playerId" && typeof val === "number"
  ) as [string, number][];

  const values = entries.map(([, val]) => val);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
  );

  const selectedValue = (ranking as Record<string, number>)[source];
  const zScore = (selectedValue - mean) / stdDev;

  if (zScore <= -1.25) return "high";
  if (zScore >= 1.25) return "low";
  return null;
}
