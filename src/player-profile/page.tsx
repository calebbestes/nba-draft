import { useParams } from "react-router-dom";
import { useState } from "react";
import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";
import {
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import PlayerGameLogTable from "./game-log-chart";

export default function PlayerProfile() {
  const { name } = useParams();
  const player = bio.find((p) => p.name === decodeURIComponent(name || ""));

  const [view, setView] = useState<"season" | "game">("season");

  if (!player) return <div>Player not found</div>;

  const seasonStats = seasonLogs.find((s) => s.playerId === player.playerId);
  const playerGameLogs = game_logs.filter(
    (g) => g.playerId === player.playerId
  );

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "season" | "game" | null
  ) => {
    if (newView) setView(newView);
  };

  const numericStatKeys = [
    "gp",
    "gs",
    "fgm",
    "fga",
    "fg%",
    "ftm",
    "fta",
    "ft%",
    "oreb",
    "dreb",
    "reb",
    "ast",
    "stl",
    "blk",
    "tov",
    "pf",
    "pts",
    "plusMinus",
  ];
  const displayKeys = Object.keys(seasonStats ?? {}).filter(
    (key) => key !== "playerId" && key !== "age"
  );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        {player.name}
      </Typography>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="season">Season Stats</ToggleButton>
        <ToggleButton value="game">Per Game Logs</ToggleButton>
      </ToggleButtonGroup>

      {view === "season" ? (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                {displayKeys.map((key) => (
                  <TableCell key={key} align="center">
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {displayKeys.map((key) => (
                  <TableCell key={key} align="center">
                    {seasonStats?.[key as keyof typeof seasonStats] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <PlayerGameLogTable gameLogs={playerGameLogs} />
      )}
    </Box>
  );
}
