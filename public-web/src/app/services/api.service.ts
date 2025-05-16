import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getVideoUrl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/video-url`);
  }

  getClientConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/client-config`, {
      headers: this.getHeaders()
    });
  }

  saveGameResult(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/game-results`, data);
  }

  getGameResults(page: number, limit: number, clientFilter?: string, dateFilter?: string): Observable<any> {
    let url = `${this.apiUrl}/game-results?page=${page}&limit=${limit}`;
    if (clientFilter) {
      url += `&client=${clientFilter}`;
    }
    if (dateFilter) {
      url += `&date=${dateFilter}`;
    }
    return this.http.get(url);
  }

  getClients(page: number, limit: number, searchTerm?: string, distributorId?: string): Observable<any> {
    let url = `${this.apiUrl}/clients?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }
    if (distributorId) {
      url += `&distributor=${distributorId}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  createClient(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients`, clientData);
  }

  updateClient(clientId: number, clientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${clientId}`, clientData);
  }

  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}`);
  }

  // Distributor methods
  getDistributors(page: number, limit: number, searchTerm?: string): Observable<any> {
    let url = `${this.apiUrl}/distributors?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  createDistributor(distributorData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/distributors`, distributorData, { headers: this.getHeaders() });
  }

  updateDistributor(distributorId: number, distributorData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/distributors/${distributorId}`, distributorData, { headers: this.getHeaders() });
  }

  deleteDistributor(distributorId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/distributors/${distributorId}`, { headers: this.getHeaders() });
  }
} 