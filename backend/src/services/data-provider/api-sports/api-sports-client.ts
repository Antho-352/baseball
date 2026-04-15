/**
 * HTTP Client pour API-Sports Baseball
 * https://v1.baseball.api-sports.io/
 */

const BASE_URL = 'https://v1.baseball.api-sports.io';

export interface APISportsResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

export class APISportsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Effectue une requête GET à l'API
   */
  async get<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<APISportsResponse<T>> {
    const url = new URL(`${BASE_URL}${endpoint}`);

    // Ajouter les query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API-Sports error: ${response.status} ${response.statusText}`
      );
    }

    const data: APISportsResponse<T> = await response.json();

    // Vérifier les erreurs dans la réponse
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(`API-Sports error: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }
}
