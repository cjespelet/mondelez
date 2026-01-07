import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface SpinResponse {
  success: boolean;
  segmentIndex: number;
  prize: string;
  result: 'Ganado' | 'Perdido';
}

interface SaveResultPayload {
  clientId: string;
  result: 'Ganado' | 'Perdido';
  prize: string;
  phoneNumber: string;
  date: string;
  gameType: string;
}

@Injectable({ providedIn: 'root' })
export class WheelGameService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  spin(clientId: number): Observable<SpinResponse> {
    return this.http.post<SpinResponse>(`${this.apiUrl}/wheel/spin`, { clientId });
  }

  saveResult(payload: SaveResultPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/wheel/save-result`, payload);
  }

  updateResultPhone(resultId: number, phoneNumber: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/wheel/update-phone/${resultId}`, { phoneNumber });
  }
}


