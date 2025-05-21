import { Card, CardContent, Avatar, Typography, Box, Chip, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { bio } from "../data/bio";
import { scoutRankings } from "../data/scoutRankings";
import { Link } from "react-router-dom";
import { useState } from "react";

const rankingSources = [
  "ESPN Rank",
  "Average",
  "Sam Vecenie Rank",
  "Kevin O'Connor Rank",
  "Kyle Boone Rank",
  "Gary Parrish Rank",
];

function getRank(playerId: number, source: string): number {
  const ranking = scoutRankings.find((r) => r.playerId === playerId);
  if (!ranking) return Infinity;

  if (source === "Average") {
    const values = Object.entries(ranking)
      .filter(([key, val]) => key !== "playerId" && typeof val === "number")
      .map(([, val]) => val as number);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : Infinity;
  }

  return typeof (ranking as Record<string, number | null>)[source] === "number"
    ? (ranking as Record<string, number | null>)[source]!
    : Infinity;
}

export default function BigBoard() {
  const [sortKey, setSortKey] = useState("ESPN Rank");

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

          return (
            <div key={player.playerId} className="w-full">
              <Link to={`/player/${player.playerId}`} className="no-underline">
                <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl h-full rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-md">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Box className="relative mb-4">
                      <Avatar
                        src={player.photoUrl || undefined}
                        alt={player.name}
                        sx={{ width: 80, height: 80 }}
                      >
                        {player.firstName[0]}
                      </Avatar>
                      {typeof rank === "number" && isFinite(rank) && (
                        <Chip
                          label={`#${Math.round(rank)}`}
                          size="small"
                          color="primary"
                          sx={{ position: 'absolute', top: -10, right: -10, fontWeight: 'bold' }}
                        />
                      )}
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
