import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ClientResponse {
  success: boolean;
  clients: Array<{
    id: number;
    name: string;
    video_url: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClients(): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/clients`);
  }
} 