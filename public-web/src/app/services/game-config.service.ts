import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Game {
  id: number;
  name: string;
  description?: string;
}

export interface ClientPrize {
  id?: number;
  description: string;
  order_index: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllGames(): Observable<{ success: boolean; games: Game[] }> {
    return this.http.get<{ success: boolean; games: Game[] }>(
      `${this.apiUrl}/game-config/games`,
      { headers: this.getHeaders() }
    );
  }

  getClientGames(clientId: number): Observable<{ success: boolean; games: Game[] }> {
    return this.http.get<{ success: boolean; games: Game[] }>(
      `${this.apiUrl}/game-config/clients/${clientId}/games`,
      { headers: this.getHeaders() }
    );
  }

  assignGames(clientId: number, gameIds: number[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/game-config/clients/${clientId}/games`,
      { gameIds },
      { headers: this.getHeaders() }
    );
  }

  getClientPrizes(clientId: number): Observable<{ success: boolean; prizes: ClientPrize[] }> {
    return this.http.get<{ success: boolean; prizes: ClientPrize[] }>(
      `${this.apiUrl}/game-config/clients/${clientId}/prizes`,
      { headers: this.getHeaders() }
    );
  }

  saveClientPrizes(clientId: number, prizes: ClientPrize[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/game-config/clients/${clientId}/prizes`,
      { prizes },
      { headers: this.getHeaders() }
    );
  }
}


