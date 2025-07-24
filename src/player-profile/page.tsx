import { useParams } from "react-router-dom";
import { useState } from "react";
import { players } from "../data/players";
import {
  Typography,
  Box,
  Paper,
} from "@mui/material";
import Header from "../components/header";
import AddReportDialog from "../components/add-report-dialog";
import { scoutingReports as initialReports } from "../data/scouting-reports";
import StarButton from "../components/star";
import Footer from "../components/footer";

export default function PlayerProfile() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const player = players.find((p) => p.name === decodedName);
  const [starred, setStarred] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("starredPlayers");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  function toggleStar(playerName: string) {
    setStarred((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerName)) {
        newSet.delete(playerName);
      } else {
        newSet.add(playerName);
      }
      localStorage.setItem("starredPlayers", JSON.stringify([...newSet]));
      return newSet;
    });
  }

  const [reports, setReports] = useState(initialReports);
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
      playerId: player.name, // Using name as ID since we don't have playerId
      report: data.notes,
    };

    setReports((prev) => [...prev, newReport]);
  };

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
            {player.profile_url && (
              <Box
                component="img"
                src={player.profile_url}
                alt={`${player.name} headshot`}
                className="w-52 h-52 md:w-72 md:h-72 rounded-2xl object-cover border-4 border-[#00A3E0]/20 shadow-xl"
              />
            )}
            <Box className="flex-1 text-center md:text-left space-y-3">
              <Box className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <Typography
                  variant="h3"
                  className="font-bebas text-white tracking-wide text-4xl md:text-5xl uppercase drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
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
                  <StarButton
                    isStarred={starred.has(player.name)}
                    onToggle={() => toggleStar(player.name)}
                  />
                </Box>

                <AddReportDialog
                  open={openReportDialog}
                  onClose={() => setOpenReportDialog(false)}
                  onSubmit={handleReportSubmit}
                  playerName={player.name}
                />
              </Box>

              <Typography variant="h6" className="text-[#A0AEC0]">
                {player.team} • {player.conference}
              </Typography>

              <Box className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Height
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.height}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Weight
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.weight}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Position
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.position}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Hometown
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.hometown}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    Class Year
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.class_year}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-[#A0AEC0]">
                    High School
                  </Typography>
                  <Typography className="text-[#00A3E0] font-medium">
                    {player.high_school}
                  </Typography>
                </div>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box className="mt-10 space-y-4">
          <Typography variant="h5" className="text-white font-semibold">
            Scouting Reports
          </Typography>
          {(() => {
            const playerReports = reports.filter(
              (r) => r.playerId === player.name
            );

            if (playerReports.length === 0) {
              return (
                <Typography
                  variant="body1"
                  className="text-[#CBD5E1] italic text-sm mt-2 mb-6"
                >
                  No scouting reports for this player yet.
                </Typography>
              );
            }

            return playerReports.map((r) => (
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
            ));
          })()}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
