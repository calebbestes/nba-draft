import { MenuItem, Select, FormControl } from "@mui/material";
import { players } from "../data/players";
import { useEffect, useMemo, useState } from "react";
import { type Position } from "../utils/get-player-positions";
import { getPositionMap } from "../utils/get-player-positions";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import PlayerGrid from "./player-grid";

export default function BigBoard() {
  const [starred, setStarred] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("starredPlayers");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });

  useEffect(() => {
    localStorage.setItem("searchQuery", searchQuery);
  }, [searchQuery]);
  
  const [positionFilter, setPositionFilter] = useState<Position>(() => {
    return (localStorage.getItem("positionFilter") as Position) || "All";
  });

  useEffect(() => {
    localStorage.setItem("positionFilter", positionFilter);
  }, [positionFilter]);

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

  const positionMap = useMemo(
    () => getPositionMap(players.map((p) => ({ name: p.name, position: p.position }))),
    []
  );

  const sortedPlayers = useMemo(() => {
    return [...players]
      .filter((player) => {
        const position = positionMap[player.name] ?? "G";
        const matchesPosition =
          positionFilter === "All" ||
          (positionFilter === "Starred"
            ? starred.has(player.name)
            : position === positionFilter);

        const matchesSearch = player.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return matchesPosition && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [
    positionFilter,
    positionMap,
    starred,
    searchQuery,
  ]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0C2340] text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-full sm:w-72">
            <div className="w-full rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm">
              <div className="mb-1 text-sm font-semibold text-[#B8C4CA]">
                Search by Name
              </div>
              <input
                type="text"
                placeholder="e.g. Brian Scalabrine"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/90 text-[#002B5E] placeholder-[#94A3B8] rounded-xl shadow-sm border border-[#00A3E0] px-4 py-2.5 font-semibold focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="w-70 rounded-xl border border-[#00A3E0] p-3 bg-white/10 backdrop-blur-sm shadow-sm flex flex-col">
            <FormControl sx={{ width: "100%" }}>
              <div className="grid grid-cols-[60px_1fr] items-center gap-2 h-8">
                <label
                  htmlFor="position-select"
                  className="text-sm font-semibold text-[#B8C4CA]"
                >
                  Filter:
                </label>
                <Select
                  id="position-select"
                  size="small"
                  value={positionFilter}
                  onChange={(e) =>
                    setPositionFilter(e.target.value as Position)
                  }
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    px: 1.25,
                    py: 0.5,
                    height: "1.9rem",
                    minHeight: "unset",
                    color: "#002B5E",
                    border: "1px solid #00A3E0", // ✅ consistent border
                    borderRadius: "0.75rem", // rounded-xl
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "& .MuiSelect-icon": {
                      color: "#00538C",
                    },
                    "&:hover": {
                      borderColor: "#B8C4CA",
                    },
                  }}
                >
                  {[
                    "All",
                    "Starred",
                    "G",
                    "F", 
                    "C",
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === "G" ? "Guard" : type === "F" ? "Forward" : type === "C" ? "Center" : type}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </FormControl>

          </div>

          {starred.size > 0 && (
            <div className="ml-auto">
              <button
                disabled={starred.size > 5}
                onClick={() => {
                  const ids = [...starred].slice(0, 5);
                  navigate(`/compare?players=${encodeURIComponent(ids.join(","))}`);
                }}
                className={`px-8 py-3 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-in-out
                  ${
                    starred.size > 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#007A33] to-[#00B140] hover:from-[#006326] hover:to-[#009933] shadow-xl hover:shadow-2xl"
                  }
                `}
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
              >
                Compare Starred Players
              </button>
            </div>
          )}
        </div>
      </div>

      <PlayerGrid
        sortedPlayers={sortedPlayers}
        starred={starred}
        toggleStar={toggleStar}
      />
      <Footer />
    </div>
  );
}
