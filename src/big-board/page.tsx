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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <Typography variant="h4" className="font-extrabold text-gray-800">
          🏀 NBA Draft Big Board
        </Typography>

        <FormControl className="mt-4 sm:mt-0 w-64">
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortKey}
            label="Sort by"
            onChange={(e) => setSortKey(e.target.value)}
            className="rounded-lg shadow-sm bg-white"
          >
            {rankingSources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedPlayers.map((player: Player) => {
          const rank = getRank(player.playerId, sortKey, avgRankMap);
          const [minRank, minSource, maxRank, maxSource] = getMinMaxRank(
            player.playerId
          );
          const outlierType = getOutlierType(player.playerId, sortKey);

          return (
            <div key={player.playerId} className="w-full">
              <Card
                key={player.playerId}
                onClick={() =>
                  navigate(`/player/${encodeURIComponent(player.name)}`)
                }
                className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl h-full rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-md"
              >
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Box className="flex items-center justify-between w-full mb-4">
                    <Box className="flex items-center space-x-4">
                      {typeof rank === "number" && isFinite(rank) && (
                        <Box className="flex items-center justify-center w-20 h-20 rounded-lg bg-blue-600 text-white font-extrabold text-3xl">
                          #{Math.round(rank)}
                        </Box>
                      )}
                    </Box>
                    <Avatar
                      src={player.photoUrl || undefined}
                      alt={player.name}
                      sx={{ width: 80, height: 80 }}
                    >
                      {player.firstName[0]}
                    </Avatar>
                    <Box className="flex flex-col items-end text-xs">
                      {sortKey === "Average Rank" ? (
                        <>
                          {isFinite(minRank) && (
                            <span className="text-[0.75rem] font-semibold text-green-600">
                              Highest Rank: {minRank} (
                              {minSource.replace(" Rank", "")})
                            </span>
                          )}
                          {isFinite(maxRank) && (
                            <span className="text-[0.75rem] font-semibold text-red-600">
                              Lowest Rank: {maxRank} (
                              {maxSource.replace(" Rank", "")})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {outlierType === "high" && (
                            <Tooltip title="This scout is significantly higher on this player">
                              <span className="text-yellow-500 text-lg font-bold cursor-help">
                                🔥
                              </span>
                            </Tooltip>
                          )}
                          {outlierType === "low" && (
                            <Tooltip title="This scout is significantly lower on this player">
                              <span className="text-blue-500 text-lg font-bold cursor-help">
                                ❄️
                              </span>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                  <Typography
                    variant="h6"
                    className="font-semibold text-gray-900"
                  >
                    {player.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="italic"
                  >
                    {player.currentTeam} — {player.league}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {player.homeTown}, {player.homeCountry}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
