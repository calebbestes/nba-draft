// components/PlayerGrid.tsx

import StarButton from "../components/star";
import { useNavigate } from "react-router-dom";
import { players, type Player } from "../data/players";

export default function PlayerGrid({
  sortedPlayers,
  starred,
  toggleStar,
}: {
  sortedPlayers: Player[];
  starred: Set<string>;
  toggleStar: (name: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {sortedPlayers.map((player: Player) => {
        return (
          <div key={player.name} className="cursor-pointer transform scale-90 sm:scale-95 md:scale-100">
            <div
              onClick={() =>
                navigate(`/player/${encodeURIComponent(player.name)}`)
              }
              className="rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-out bg-white/90 backdrop-blur-sm border border-transparent hover:border-[#00A3E0]"
            >
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <StarButton
                    isStarred={starred.has(player.name)}
                    onToggle={() => toggleStar(player.name)}
                  />
                </div>
                
                <div className="absolute top-4 left-4 z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full font-extrabold text-lg shadow-md bg-black hover:bg-gray-900 text-[#C0C0C0]">
                    {player.position}
                  </div>
                </div>

                {player.profile_url ? (
                  <img
                    src={player.profile_url}
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
                    <span>{player.height}</span>
                  </h2>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{player.team}</span>
                    <span>{player.class_year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
