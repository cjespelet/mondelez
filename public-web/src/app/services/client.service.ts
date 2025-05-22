import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ClientResponse {
  success: boolean;
  clients: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

interface CreateClientResponse {
  success: boolean;
  message?: string;
  client?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getClients(page: number = 1, limit: number = 10, search?: string, distributorId?: string): Observable<ClientResponse> {
    let url = `${this.apiUrl}/clients?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (distributorId) url += `&distributor=${distributorId}`;
    
    return this.http.get<ClientResponse>(url, { headers: this.getHeaders() });
  }

  createClient(clientData: { 
    name: string; 
    username: string; 
    password: string; 
    video_url: string;
  }): Observable<CreateClientResponse> {
    return this.http.post<CreateClientResponse>(
      `${this.apiUrl}/clients`, 
      clientData,
      { headers: this.getHeaders() }
    );
  }

  updateClient(clientId: number, clientData: { 
    name: string; 
    video_url: string; 
    password?: string;
  }): Observable<CreateClientResponse> {
    return this.http.put<CreateClientResponse>(
      `${this.apiUrl}/clients/${clientId}`, 
      clientData,
      { headers: this.getHeaders() }
    );
  }

  deleteClient(clientId: number): Observable<CreateClientResponse> {
    return this.http.delete<CreateClientResponse>(
      `${this.apiUrl}/clients/${clientId}`,
      { headers: this.getHeaders() }
    );
  }
} 