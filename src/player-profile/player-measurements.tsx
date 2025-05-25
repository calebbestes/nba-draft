import { Box, Typography, Paper, Tooltip } from "@mui/material";
import { measurements } from "../data/measurements";

interface Props {
  playerId: number;
}

const fields: {
  label: string;
  key: keyof (typeof measurements)[number];
  format: (val: number) => string;
}[] = [
  {
    label: "Height (No Shoes)",
    key: "heightNoShoes",
    format: (v) => `${(v / 12).toFixed(1)} ft`,
  },
  {
    label: "Height (Shoes)",
    key: "heightShoes",
    format: (v) => `${(v / 12).toFixed(1)} ft`,
  },
  {
    label: "Wingspan",
    key: "wingspan",
    format: (v) => `${(v / 12).toFixed(1)} ft`,
  },
  { label: "Standing Reach", key: "reach", format: (v) => `${v} in` },
  { label: "Max Vertical", key: "maxVertical", format: (v) => `${v} in` },
  {
    label: "No Step Vertical",
    key: "noStepVertical",
    format: (v) => `${v} in`,
  },
  { label: "Weight", key: "weight", format: (v) => `${v} lbs` },
  { label: "Body Fat %", key: "bodyFat", format: (v) => `${v.toFixed(1)}%` },
  { label: "Hand Length", key: "handLength", format: (v) => `${v} in` },
  { label: "Hand Width", key: "handWidth", format: (v) => `${v} in` },
  { label: "Lane Agility", key: "agility", format: (v) => `${v} sec` },
  { label: "Sprint (3/4 court)", key: "sprint", format: (v) => `${v} sec` },
  { label: "Shuttle Best", key: "shuttleBest", format: (v) => `${v}` },
];

export default function PlayerMeasurements({ playerId }: Props) {
  const data = measurements.find((m) => m.playerId === playerId);
  if (!data) return null;

  const averages: Record<string, number> = {};
  fields.forEach(({ key }) => {
    const values = measurements
      .map((m) => m[key])
      .filter((v): v is number => typeof v === "number");

    if (values.length) {
      averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
    }
  });

  return (
    <Box className="">
      <Typography variant="h5" className="text-white font-semibold mb-3">
        Combine Measurements
      </Typography>
      <Paper className="p-4 bg-white/10 border border-white/20 rounded-xl text-white shadow-md overflow-x-auto">
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: {
              xs: "row",
              md: "column",
            },
            gridAutoRows: {
              xs: "auto",
              md: "1fr",
            },
            gridTemplateRows: {
              xs: "none",
              md: "repeat(4, auto)",
            },
            gap: 2,
          }}
        >
          {fields.map(({ label, key, format }) => {
            const rawValue = data[key];
            const avg = averages[key];
            let value = "N/A";
            let colorClass = "text-[#00A3E0]"; // default blue
            const avgDisplay = "";

            if (typeof rawValue === "number" && typeof avg === "number") {
              value = format(rawValue);

              const stdDev = Math.sqrt(
                measurements
                  .map((m) => m[key])
                  .filter((v): v is number => typeof v === "number")
                  .reduce((sum, val) => sum + (val - avg) ** 2, 0) /
                  measurements.length
              );

              const zScore = stdDev === 0 ? 0 : (rawValue - avg) / stdDev;

              if (zScore >= 1) colorClass = "text-green-400";
              else if (zScore <= -1) colorClass = "text-red-400";
            }

            return (
              <Tooltip key={label} title={avgDisplay} placement="top" arrow>
                <Box className="flex justify-between border-b border-white/10 py-1 min-w-[250px] cursor-help">
                  <Typography variant="body2" className="text-[#A0AEC0] w-1/2">
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${colorClass} text-right w-1/2 font-medium`}
                  >
                    {value}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
