import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GameResultsResponse, GameResult } from '../interfaces/game.interface';



interface PhoneNumberData {
  clientId: string;
  phoneNumber: string;
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<boolean>(false);
  gameState$ = this.gameState.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  startGame() {
    this.gameState.next(true);
  }

  endGame() {
    this.gameState.next(false);
  }

  getGameResults(params: {
    page: number;
    limit: number;
    date?: string;
    client?: string;
    distributor?: string;
  }): Observable<GameResultsResponse> {
    let url = `${this.apiUrl}/game-results?page=${params.page}&limit=${params.limit}`;
    
    if (params.date) {
      url += `&date=${params.date}`;
    }
    if (params.client) {
      url += `&client=${params.client}`;
    }
    if (params.distributor) {
      url += `&distributor=${params.distributor}`;
    }
    
    return this.http.get<GameResultsResponse>(url, { headers: this.getHeaders() });
  }

  saveGameResult(data: { clientId: string; result: string; phoneNumber?: string; date: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/game-results`, data);
  }

  savePhoneNumber(data: PhoneNumberData): Observable<any> {
    return this.http.post(`${this.apiUrl}/phone-numbers`, data);
  }
} 