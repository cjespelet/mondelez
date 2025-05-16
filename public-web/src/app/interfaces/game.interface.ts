export interface GameResult {
  id: number;
  client_id: string;
  result: string;
  date: string;
  created_at: string;
  client_name?: string;
  phone_number?: string;
}

export interface GameResultsResponse {
  results: GameResult[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientResponse {
  success: boolean;
  clients: Array<{
    id: number;
    name: string;
    video_url: string;
  }>;
} 