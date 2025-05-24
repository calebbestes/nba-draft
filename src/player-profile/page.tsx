import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { bio } from "../data/bio";
import { game_logs } from "../data/game-logs";
import { seasonLogs } from "../data/season-logs";
import {
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import PlayerGameLogTable from "./game-log-chart";
import PlayerSeasonStatsTable from "./PlayerSeasonStatsTable";
import Header from "../components/header";
import AddReportDialog from "../components/add-report-dialog";
import { scoutingReports as initialReports } from "../data/scouting-reports";

export default function PlayerProfile() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const player = bio.find((p) => p.name === decodedName);
  const [reports, setReports] = useState(initialReports);

  const [view, setView] = useState<"season" | "game">("season");
  function calculateAge(birthDateStr: string): number {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const seasonStats = useMemo(() => {
    return player
      ? seasonLogs.find((s) => s.playerId === player.playerId)
      : null;
  }, [player]);
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const handleReportSubmit = (data: {
    playerName: string;
    scoutName: string;
    notes: string;
  }) => {
    if (!player) return;

    const newReport = {
      scout: data.scoutName,
      reportId: crypto.randomUUID(),
      playerId: player.playerId,
      report: data.notes,
    };

    setReports((prev) => [...prev, newReport]);
  };

  const playerGameLogs = useMemo(() => {
    return player
      ? game_logs.filter((g) => g.playerId === player.playerId)
      : [];
  }, [player]);

  const { means, stdDevs } = useMemo(() => {
    const allStats = seasonLogs.filter((s) => s !== null);
    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};

    if (!allStats.length) return { means, stdDevs };

    Object.keys(allStats[0] || {}).forEach((key) => {
      if (key === "playerId" || key === "age") return;

      const values = allStats
        .map((s) => s[key as keyof typeof s])
        .filter((v): v is number => v !== null);

      if (!values.length) return;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      means[key] = mean;

      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      stdDevs[key] = Math.sqrt(variance);
    });

    return { means, stdDevs };
  }, []);

  if (!player) return <div>Player not found</div>;
  return (
    <Box className="min-h-screen bg-[#0C2340] text-white">
      <Header />
      <Box className="w-full px-4 sm:px-6 lg:px-8">
        <Paper
          elevation={5}
          className="relative mb-10 bg-gradient-to-br from-[#0A1C33]/95 to-[#16243E]/95 backdrop-blur-sm rounded-2xl border border-[#2E3A59] shadow-4xl"
        >
          <Box
            className="absolute inset-0 opacity-5 z-0 bg-center bg-no-repeat bg-contain"
            style={{
              backgroundImage:
                "url('../assets/dallas-mavericks-1-removebg-preview.png')",
            }}
          />

          <Box className="h-1 w-full bg-gradient-to-r from-[#00A3E0] via-[#00D9FF] to-[#A0AEC0] animate-pulse" />

          <Box className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            {player.photoUrl && (
              <Box
                component="img"
                src={player.photoUrl}
                alt={`${player.name} headshot`}
                className="w-40 h-40 md:w-52 md:h-52 rounded-2xl object-cover border-4 border-[#00A3E0]/20 shadow-xl"
              />
            )}
            <Box className="flex-1 text-center md:text-left space-y-3">
              <Box className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <Typography
                  variant="h3"
                  className="font-bebas text-white tracking-wide text-4xl md:text-5xl uppercase drop-shadow-lg"
                >
                  {player.name}
                </Typography>
                <Box className="flex gap-4 flex-wrap justify-center md:justify-start">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      player.name + " highlights"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#00A3E0]/90 hover:bg-[#007DC5] text-white font-semibold px-4 py-2 rounded-xl shadow-md backdrop-blur-md border border-white/10 transition"
                  >
                    Watch Highlights
                  </a>
                  <button
                    onClick={() => setOpenReportDialog(true)}
                    className="bg-[#00A3E0]/90 hover:bg-[#007DC5] text-white font-semibold px-4 py-2 rounded-xl shadow-md transition"
                  >
                    + Add Report
                  </button>
                </Box>

                <AddReportDialog
                  open={openReportDialog}
                  onClose={() => setOpenReportDialog(false)}
                  onSubmit={handleReportSubmit}
                  playerName={player.name}
                />
              </Box>

              <Typography variant="h6" className="text-[#A0AEC0]">
                {player.currentTeam} • {player.league}
              </Typography>

              <Box className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Height
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {Math.floor(player.height / 12)}'{player.height % 12}"
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Weight
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.weight} lbs
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Nationality
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.nationality}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Hometown
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.homeTown}, {player.homeState}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Age
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {calculateAge(player.birthDate)} years
                  </Typography>
                </div>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box className="mb-6">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            className="rounded-xl shadow-xl border border-[#CBD5E1] bg-[#F8FAFC]"
          >
            <ToggleButton
              value="season"
              className={`px-6 py-2 font-semibold transition-all duration-200 border border-[#CBD5E1] ${
                view === "season"
                  ? "bg-white text-[#0C2340]"
                  : "bg-[#F1F5F9] text-[#0C2340] hover:bg-white"
              }`}
            >
              Season Stats
            </ToggleButton>
            <ToggleButton
              value="game"
              className={`px-6 py-2 font-semibold transition-all duration-200 border border-[#CBD5E1] ${
                view === "game"
                  ? "bg-white text-[#0C2340]"
                  : "bg-[#F1F5F9] text-[#0C2340] hover:bg-white"
              }`}
            >
              Game Log
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box className="bg-[#1D2D50] text-white rounded-xl shadow-lg p-6">
          {view === "season" ? (
            seasonStats && (
              <PlayerSeasonStatsTable
                stats={seasonLogs.filter((s) => s.playerId === player.playerId)}
                means={means}
                stdDevs={stdDevs}
              />
            )
          ) : (
            <PlayerGameLogTable gameLogs={playerGameLogs} />
          )}
        </Box>
        <Box className="mt-10 space-y-4">
          <Typography variant="h5" className="text-white font-semibold">
            Scouting Reports
          </Typography>
          {reports
            .filter((r) => r.playerId === player.playerId)
            .map((r) => (
              <Paper
                key={r.reportId}
                className="p-4 bg-white/10 border border-white/20 rounded-xl text-white shadow-md"
              >
                <Typography
                  variant="subtitle1"
                  className="text-[#00A3E0] font-bold"
                >
                  {r.scout}
                </Typography>
                <Typography variant="body2" className="mt-1 text-black">
                  {r.report}
                </Typography>
              </Paper>
            ))}
        </Box>
      </Box>
    </Box>
  );
}
