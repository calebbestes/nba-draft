import { Card, CardContent, Typography, Box, MenuItem, Select, InputLabel, FormControl, Avatar } from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { Link } from "react-router-dom";
import { useState } from "react";

const rankingSources = [
  "Average Rank",
  "ESPN Rank",
  "Sam Vecenie Rank",
  "Kevin O'Connor Rank",
  "Kyle Boone Rank",
  "Gary Parrish Rank",
];



function getRank(playerId: number, source: string): number {
  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return Infinity;

  if (source === "Average Rank") {
    const values = Object.entries(ranking)
      .filter(([key, val]) => key !== "playerId" && typeof val === "number")
      .map(([, val]) => val as number);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : Infinity;
  }

  return typeof (ranking as Record<string, number | null>)[source] === "number"
    ? (ranking as Record<string, number | null>)[source]!
    : Infinity;
}

function getMinMaxRank(playerId: number): [number, string, number, string] {
  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return [Infinity, "", Infinity, ""];

  const entries = Object.entries(ranking)
    .filter(([key, val]) => key !== "playerId" && typeof val === "number") as [string, number][];

  if (!entries.length) return [Infinity, "", Infinity, ""];

  let minEntry = entries[0];
  let maxEntry = entries[0];

  for (const entry of entries) {
    if (entry[1] < minEntry[1]) minEntry = entry;
    if (entry[1] > maxEntry[1]) maxEntry = entry;
  }

  return [minEntry[1], minEntry[0], maxEntry[1], maxEntry[0]];
}


export default function BigBoard() {
  const [sortKey, setSortKey] = useState("Average Rank");

  const sortedPlayers = [...bio].sort(
    (a, b) => getRank(a.playerId, sortKey) - getRank(b.playerId, sortKey)
  );

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
        {sortedPlayers.map((player) => {
          const rank = getRank(player.playerId, sortKey);
          const [minRank, minSource, maxRank, maxSource] = getMinMaxRank(player.playerId);


          return (
            <div key={player.playerId} className="w-full">
              <Link to={`/player/${player.playerId}`} className="no-underline">
                <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl h-full rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-md">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Box className="flex items-center justify-between w-full mb-4">
                    <Box className="flex items-center space-x-4">
                      {typeof rank === "number" && isFinite(rank) && (
                        <Box className="flex items-center justify-center w-20 h-20 rounded-lg bg-blue-600 text-white font-extrabold text-3xl">
                          #{Math.round(rank)}
                        </Box>
                      )}
                      <Avatar
                        src={player.photoUrl || undefined}
                        alt={player.name}
                        sx={{ width: 80, height: 80 }}
                      >
                        {player.firstName[0]}
                      </Avatar>
                    </Box>
                  <Box className="flex flex-col items-end text-xs">
                    {isFinite(minRank) && (
                      <span className="text-[0.75rem] font-semibold text-green-600">
                        {minSource}: #{minRank}
                      </span>
                    )}
                    {isFinite(maxRank) && (
                      <span className="text-[0.75rem] font-semibold text-red-600">
                        {maxSource}: #{maxRank}
                      </span>
                    )}
                  </Box>
                  </Box>
                    <Typography variant="h6" className="font-semibold text-gray-900">
                      {player.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="italic">
                      {player.currentTeam} — {player.league}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {player.homeTown}, {player.homeCountry}
                    </Typography>
                  </CardContent>

                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
