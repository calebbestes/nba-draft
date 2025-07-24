import playersData from './all-players.json';

export interface Player {
  conference: string;
  team: string;
  jersey_number: string;
  name: string;
  position: string;
  height: string;
  weight: string;
  class_year: string;
  hometown: string;
  high_school: string;
  profile_url: string;
}

export const players: Player[] = playersData.players;