import { Tooltip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface StarButtonProps {
  isStarred: boolean;
  onToggle: () => void;
}

export default function StarButton({ isStarred, onToggle }: StarButtonProps) {
  return (
    <Tooltip title="Watch this player" arrow placement="top">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          onToggle();
        }}
        className={`transition-transform transform hover:scale-110 ${
          isStarred
            ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(255,255,0,0.7)]"
            : "text-gray-300 hover:text-yellow-300"
        }`}
      >
        {isStarred ? (
          <StarIcon fontSize="large" />
        ) : (
          <StarBorderIcon fontSize="large" />
        )}
      </button>
    </Tooltip>
  );
}
