import { Box, Typography, Paper } from "@mui/material";
import { measurements } from "../data/measurements";

interface Props {
  playerId: number;
}

export default function PlayerMeasurements({ playerId }: Props) {
  const data = measurements.find((m) => m.playerId === playerId);

  if (!data) return null;

  const rows: [string, string | number | null][] = [
    [
      "Height (No Shoes)",
      data.heightNoShoes != null
        ? `${(data.heightNoShoes / 12).toFixed(1)} ft`
        : "N/A",
    ],
    ["Height (Shoes)", `${(data.heightShoes / 12).toFixed(1)} ft`],
    [
      "Wingspan",
      data.wingspan != null ? `${(data.wingspan / 12).toFixed(1)} ft` : "N/A",
    ],
    ["Standing Reach", `${data.reach} in`],
    ["Max Vertical", `${data.maxVertical} in`],
    ["No Step Vertical", `${data.noStepVertical} in`],
    ["Weight", `${data.weight} lbs`],
    ["Body Fat %", data.bodyFat ?? "N/A"],
    ["Hand Length", `${data.handLength} in`],
    ["Hand Width", `${data.handWidth} in`],
    ["Lane Agility", `${data.agility} sec`],
    ["Sprint (3/4 court)", `${data.sprint} sec`],
    ["Shuttle Best", data.shuttleBest ?? "N/A"],
  ];

  return (
    <Box className="mt-10">
      <Typography variant="h5" className="text-white font-semibold mb-3">
        Combine Measurements
      </Typography>
      <Paper className="p-4 bg-white/10 border border-white/20 rounded-xl text-white shadow-md">
        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <Typography variant="body2" className="text-[#A0AEC0]">
                {label}
              </Typography>
              <Typography className="text-[#00A3E0] font-medium">
                {value}
              </Typography>
            </div>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
