import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { generatePlayerSubtitle } from "../utils/generate-subtitle";
import PlayerGameLogTable from "./game-log-chart";

export default function PlayerProfile() {
  const { name } = useParams();
  const player = bio.find((p) => p.name === decodeURIComponent(name || ""));

  const [view, setView] = useState<"season" | "game">("season");
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [loadingSubtitle, setLoadingSubtitle] = useState(false);

  const seasonStats = player
    ? seasonLogs.find((s) => s.playerId === player.playerId)
    : null;

  const playerGameLogs = player
    ? game_logs.filter((g) => g.playerId === player.playerId)
    : [];
  useEffect(() => {
    const getSubtitle = async () => {
      if (!player) return;

      setLoadingSubtitle(true);
      try {
        const generated = await generatePlayerSubtitle(player.name);
        setSubtitle(generated);
      } catch (error) {
        console.error("Subtitle generation failed:", error);
        setSubtitle("Versatile Prospect");
      } finally {
        setLoadingSubtitle(false);
      }
    };

    getSubtitle();
  }, [player]);

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
      <Box
        sx={{
          backgroundColor: "#121212",
          borderRadius: 2,
          padding: 3,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: 3,
        }}
      >
        <Box>
          <Typography variant="h4" color="white">
            {player.name}
          </Typography>
          <Typography variant="subtitle1" color="gray">
            {loadingSubtitle ? "Generating subtitle..." : subtitle}
          </Typography>
        </Box>

        {player.photoUrl && (
          <Box
            component="img"
            src={player.photoUrl}
            alt={`${player.name} headshot`}
            sx={{
              width: 160,
              height: 160,
              borderRadius: "8px",
              objectFit: "cover",
              boxShadow: 3,
            }}
          />
        )}
      </Box>

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
