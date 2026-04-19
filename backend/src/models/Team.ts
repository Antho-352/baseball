/**
 * Team Model
 */

export interface Team {
  id: number;
  league_id: number;
  external_id: string | null;
  name: string;
  slug: string;
  abbreviation: string | null;
  city: string | null;
  stadium: string | null;
  division: string | null;
  founded: number | null;
  logo_url: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTeamDTO {
  league_id: number;
  external_id?: string;
  name: string;
  slug: string;
  abbreviation?: string;
  city?: string;
  stadium?: string;
  division?: string;
  founded?: number;
  logo_url?: string;
  active?: boolean;
}

export interface UpdateTeamDTO extends Partial<CreateTeamDTO> {}

export interface TeamWithLeague extends Team {
  league_code: string;
  league_name: string;
}
