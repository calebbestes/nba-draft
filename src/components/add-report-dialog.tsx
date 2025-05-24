// components/AddReportDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    playerName: string;
    scoutName: string;
    notes: string;
  }) => void;
  playerName: string;
};

export default function AddReportDialog({
  open,
  onClose,
  onSubmit,
  playerName,
}: Props) {
  const [scoutName, setScoutName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit({ playerName: playerName, scoutName, notes });
    setScoutName("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Scouting Report</DialogTitle>
      <DialogContent className="space-y-4 mt-2">
        <TextField
          label="Player Name"
          fullWidth
          variant="outlined"
          value={playerName}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Scout Name"
          fullWidth
          variant="outlined"
          value={scoutName}
          onChange={(e) => setScoutName(e.target.value)}
        />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
