/**
 * Game Model
 */

export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';

export interface Game {
  id: number;
  league_id: number;
  external_id: string | null;
  game_date: Date;
  game_time: string | null;
  home_team_id: number;
  away_team_id: number;
  home_score: number | null;
  away_score: number | null;
  status: GameStatus;
  inning: string | null;
  venue: string | null;
  attendance: number | null;
  game_data_json: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGameDTO {
  league_id: number;
  external_id?: string;
  game_date: Date;
  game_time?: string;
  home_team_id: number;
  away_team_id: number;
  home_score?: number;
  away_score?: number;
  status?: GameStatus;
  inning?: string;
  venue?: string;
  attendance?: number;
  game_data_json?: any;
}

export interface UpdateGameDTO extends Partial<CreateGameDTO> {}

export interface GameWithTeams extends Game {
  home_team_name: string;
  home_team_abbr: string;
  away_team_name: string;
  away_team_abbr: string;
  league_code: string;
}
