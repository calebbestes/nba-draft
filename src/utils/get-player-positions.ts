export type Position = "All" | "Starred" | "G" | "F" | "C";

export function getPositionMap(
  players: { name: string; position: string }[]
): Record<string, Position> {
  const positionMap: Record<string, Position> = {};

  players.forEach(({ name, position }) => {
    positionMap[name] = position as Position;
  });

  return positionMap;
}