// components/PlayerGrid.tsx

import { Tooltip } from "@mui/material";
import StarButton from "../components/star";
import { useNavigate } from "react-router-dom";
import { scoutRankings } from "../data/scoutRankings";
import { bio } from "../data/bio";
import { getRank, getMinMaxRank, getOutlierType } from "../utils/player-rank";

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}
type BioPlayer = (typeof bio)[number];

export default function PlayerGrid({
  sortedPlayers,
  sortKey,
  starred,
  toggleStar,
  avgRankMap,
}: {
  sortedPlayers: BioPlayer[];
  sortKey: string;
  starred: Set<number>;
  toggleStar: (id: number) => void;
  avgRankMap: Record<number, number>;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {sortedPlayers.map((player: BioPlayer) => {
        const rank = getRank(player.playerId, sortKey, avgRankMap);
        const [minRank, minSource, maxRank, maxSource] = getMinMaxRank(
          player.playerId
        );
        const outlierType = getOutlierType(player.playerId, sortKey);

        return (
          <div
            key={player.playerId}
            className="cursor-pointer transform scale-90 sm:scale-95 md:scale-100"
          >
            <div
              onClick={() =>
                navigate(`/player/${encodeURIComponent(player.name)}`)
              }
              className="rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-out bg-white/90 backdrop-blur-sm border border-transparent hover:border-[#00A3E0]"
            >
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <StarButton
                    isStarred={starred.has(player.playerId)}
                    onToggle={() => toggleStar(player.playerId)}
                  />
                </div>
                <div className="absolute top-4 left-4 z-10">
                  {typeof rank === "number" && isFinite(rank) ? (
                    <Tooltip
                      title={
                        <div className="text-sm leading-tight space-y-1">
                          {Object.entries(
                            scoutRankings.find(
                              (r) => r.playerId === player.playerId
                            ) ?? {}
                          )
                            .filter(
                              ([key, val]) =>
                                key !== "playerId" && typeof val === "number"
                            )
                            .map(([source, val]) => (
                              <div key={source}>
                                <strong>{source}:</strong> #{val}
                              </div>
                            ))}
                          {outlierType === "high" && (
                            <div className="text-green-300 font-semibold pt-1">
                              ⭐ This scout ranked them significantly higher
                              than others
                            </div>
                          )}
                          {outlierType === "low" && (
                            <div className="text-red-300 font-semibold pt-1">
                              ⚠️ This scout ranked them significantly lower than
                              others
                            </div>
                          )}
                        </div>
                      }
                      arrow
                      placement="right"
                    >
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full font-extrabold text-lg shadow-md hover:shadow-lg transition cursor-help
                          ${
                            outlierType === "high"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : outlierType === "low"
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-black hover:bg-gray-900 text-[#C0C0C0]"
                          }`}
                      >
                        #{Math.round(rank)}
                      </div>
                    </Tooltip>
                  ) : sortKey !== "Average Rank" && sortKey !== "Starred" ? (
                    <Tooltip
                      title={`Not ranked by ${sortKey}`}
                      arrow
                      placement="right"
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-full font-extrabold text-lg shadow-md hover:shadow-lg transition cursor-help bg-red-600 hover:bg-red-700 text-white">
                        NR
                      </div>
                    </Tooltip>
                  ) : null}
                </div>

                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.678 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="flex items-center justify-between text-white font-bold text-xl">
                    <span>{player.name}</span>
                    <span>{formatHeight(player.height)}</span>
                  </h2>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{player.currentTeam}</span>
                    <span>{player.homeCountry}</span>
                  </div>
                </div>
              </div>

              {sortKey === "Average Rank" && (
                <div className="px-4 py-3">
                  <div className="flex justify-between text-sm font-medium gap-2">
                    {isFinite(minRank) && (
                      <Tooltip title={`Source: ${minSource}`}>
                        <span className="bg-[#002B5E] text-[#B8C4CA] px-2 py-1 rounded w-full text-center text-sm font-medium cursor-help">
                          Highest Rank: {minRank}
                        </span>
                      </Tooltip>
                    )}
                    {isFinite(maxRank) && (
                      <Tooltip title={`Source: ${maxSource}`}>
                        <span className="bg-[#B8C4CA] text-[#002B5E] px-2 py-1 rounded w-full text-center text-sm font-medium cursor-help">
                          Lowest Rank: {maxRank}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
