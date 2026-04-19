/**
 * League Model
 */

export interface League {
  id: number;
  code: string;
  name: string;
  country: string;
  logo_url: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeagueDTO {
  code: string;
  name: string;
  country: string;
  logo_url?: string;
  active?: boolean;
}

export interface UpdateLeagueDTO extends Partial<CreateLeagueDTO> {}
