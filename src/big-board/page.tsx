import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
  Avatar,
} from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

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
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <Typography variant="h3" className="font-black text-gray-800 tracking-tight">
            2025 NBA Draft Big Board
          </Typography>

          <FormControl className="mt-4 sm:mt-0 w-72">
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortKey}
              label="Sort by"
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
            >
              {rankingSources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {sortedPlayers.map((player: Player) => {
            const rank = getRank(player.playerId, sortKey, avgRankMap);
            const [minRank, minSource, maxRank, maxSource] = getMinMaxRank(
              player.playerId
            );
            const outlierType = getOutlierType(player.playerId, sortKey);

            return (
              <div key={player.playerId}>
                <Card
                  onClick={() =>
                    navigate(`/player/${encodeURIComponent(player.name)}`)
                  }
                  className="player-card rounded-3xl cursor-pointer overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="absolute top-4 left-4 z-10">
                        {typeof rank === "number" && isFinite(rank) && (
                          <div className="rank-badge">#{Math.round(rank)}</div>
                        )}
                      </div>
                      <Avatar
                        src={player.photoUrl || undefined}
                        alt={player.name}
                        sx={{ width: "100%", height: 280 }}
                        variant="square"
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <Typography variant="h5" className="font-bold text-white mb-1">
                          {player.name}
                        </Typography>
                        <div className="flex items-center justify-between">
                          <Typography variant="body2" className="text-gray-200">
                            {player.currentTeam}
                          </Typography>
                          <Typography variant="body2" className="text-gray-300">
                            {player.homeCountry}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      {sortKey === "Average Rank" ? (
                        <div className="flex justify-between gap-2">
                          {isFinite(minRank) && (
                            <span className="stat-badge stat-badge-high flex-1 text-center">
                              Highest: {minRank}
                            </span>
                          )}
                          {isFinite(maxRank) && (
                            <span className="stat-badge stat-badge-low flex-1 text-center">
                              Lowest: {maxRank}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          {outlierType === "high" && (
                            <Tooltip title="This scout is significantly higher on this player">
                              <span className="stat-badge stat-badge-high">
                                High on {player.firstName}
                              </span>
                            </Tooltip>
                          )}
                          {outlierType === "low" && (
                            <Tooltip title="This scout is significantly lower on this player">
                              <span className="stat-badge stat-badge-low">
                                Low on {player.firstName}
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}