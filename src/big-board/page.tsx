import {
  MenuItem,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import MavsLogo from "../assets/dallas-mavericks-1-removebg-preview.png";

const rankingSources = [
  "Average Rank",
  "ESPN Rank",
  "Sam Vecenie Rank",
  "Kevin O'Connor Rank",
  "Kyle Boone Rank",
  "Gary Parrish Rank",
];

export type Player = {
  name: string;
  playerId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  height: number;
  weight: number;
  highSchool: string | null;
  highSchoolState: string | null;
  homeTown: string;
  homeState: string | null;
  homeCountry: string;
  nationality: string;
  photoUrl?: string | null;
  currentTeam: string;
  league: string;
  leagueType: string;
};

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
export default function BigBoard() {
  const [sortKey, setSortKey] = useState("Average Rank");
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

  const sortedPlayers = useMemo(() => {
    return [...bio].sort((a, b) => {
      const rankA = getRank(a.playerId, sortKey, avgRankMap);
      const rankB = getRank(b.playerId, sortKey, avgRankMap);
      return (rankA ?? Infinity) - (rankB ?? Infinity);
    });
  }, [sortKey, avgRankMap]);

  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen bg-[#0C2340] text-white">
      <img
        src={MavsLogo}
        alt="Dallas Mavericks Logo"
        className="absolute top-6 right-6 w-50 sm:w-20 md:w-24 lg:w-28 z-50"
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-16 gap-10">
            <div className="text-center sm:text-left relative w-fit">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                2025 NBA Draft
                <span className="block text-[#00A3E0] bg-clip-text text-transparent bg-gradient-to-r from-[#00A3E0] to-[#A0AEC0]">
                  Big Board
                </span>
              </h1>
              <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-[#00538C] to-[#B8C4CA] rounded-md animate-pulse"></span>
            </div>
          </div>

          <div className="sm:mt-8 sm:self-end">
            <FormControl className="w-72">
              <InputLabel id="sort-select-label" sx={{ color: "#A0AEC0" }}>
                Sort by
              </InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortKey}
                label="Sort by"
                onChange={(e) => setSortKey(e.target.value)}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-[#00538C] focus:ring-2 focus:ring-[#00538C]"
                sx={{
                  fontWeight: 600,
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
            </FormControl>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {sortedPlayers.map((player: Player) => {
            const rank = getRank(player.playerId, sortKey, avgRankMap);
            const [minRank, , maxRank] = getMinMaxRank(player.playerId);
            const outlierType = getOutlierType(player.playerId, sortKey);

            return (
              <div key={player.playerId} className="cursor-pointer">
                <div
                  onClick={() =>
                    navigate(`/player/${encodeURIComponent(player.name)}`)
                  }
                  className="rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white/90 backdrop-blur-sm"
                >
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      {typeof rank === "number" && isFinite(rank) && (
                        <>
                          {outlierType === "high" || outlierType === "low" ? (
                            <Tooltip
                              title={
                                outlierType === "high"
                                  ? "This scout is significantly higher on this player"
                                  : "This scout is significantly lower on this player"
                              }
                            >
                              <div
                                className={`text-white font-semibold px-3 py-1 rounded-lg text-sm shadow transition cursor-help ${
                                  outlierType === "high"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                              >
                                #{Math.round(rank)}
                              </div>
                            </Tooltip>
                          ) : (
                            <div className="bg-[#007DC5] hover:bg-[#005A8E] text-white font-semibold px-3 py-1 rounded-lg text-sm shadow transition">
                              #{Math.round(rank)}
                            </div>
                          )}
                        </>
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
                      <h2 className="text-white font-bold text-xl">
                        {player.name}
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
                          <span className="bg-[#002B5E] text-[#B8C4CA] px-2 py-1 rounded w-full text-center text-sm font-medium">
                            Highest Rank: {minRank}
                          </span>
                        )}
                        {isFinite(maxRank) && (
                          <span className="bg-[#B8C4CA] text-[#002B5E] px-2 py-1 rounded w-full text-center text-sm font-medium">
                            Lowest Rank: {maxRank}
                          </span>
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
    </div>
  );
}
