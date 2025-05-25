export interface BioPlayer {
  playerId: number;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  height: number;
  weight: number;
  highSchool: string;
  highSchoolState: string;
  homeTown: string;
  homeState: string;
  homeCountry: string;
  currentTeam: string;
  league: string;
  leagueType: string;
  photoUrl?: string;
}
export type Specialty =
  | "All"
  | "Starred"
  | "Versatile"
  | "Stretch Big"
  | "Three and D"
  | "Pure Scorer"
  | "Utility Big"
  | "Potential";
export interface ScoutRanking {
  playerId: number;
  [source: string]: number | string | undefined; // like "ESPN Rank", "Kevin O'Connor Rank"
}
export interface PlayerStat {
  playerId: number;
  Season: number;
  League?: string;
  Team?: string;
  GP?: number;
  GS?: number;
  MP?: number;
  FGM?: number;
  FGA?: number;
  "FG%"?: number;
  "3PM"?: number;
  "3PA"?: number;
  "3P%"?: number;
  FT?: number;
  FTA?: number;
  FTP?: number;
  ORB?: number;
  DRB?: number;
  TRB?: number;
  AST?: number;
  STL?: number;
  BLK?: number;
  TOV?: number;
  PF?: number;
  PTS?: number;
  [key: string]: number | string | undefined;
}
