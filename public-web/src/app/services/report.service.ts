import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientReport {
  id: number;
  client_id: number;
  url: string;
  created_at: string;
}

export interface ReportsResponse {
  success: boolean;
  data: ClientReport[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getReports(clientId: number, page: number = 1, limit: number = 10): Observable<ReportsResponse> {
    const url = `${this.apiUrl}/clients/${clientId}/reports?page=${page}&limit=${limit}`;
    return this.http.get<ReportsResponse>(url, { headers: this.getHeaders() });
  }

  addReport(clientId: number, url: string): Observable<{ success: boolean; report: ClientReport }> {
    const endpoint = `${this.apiUrl}/clients/${clientId}/reports`;
    return this.http.post<{ success: boolean; report: ClientReport }>(endpoint, { url }, { headers: this.getHeaders() });
  }

  deleteReport(reportId: number): Observable<{ success: boolean }> {
    const endpoint = `${this.apiUrl}/reports/${reportId}`;
    return this.http.delete<{ success: boolean }>(endpoint, { headers: this.getHeaders() });
  }
}





