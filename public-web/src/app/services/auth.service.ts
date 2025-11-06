import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    clientId: number;
  };
}

interface VideoUrlResponse {
  success: boolean;
  videoUrl: string;
  transitionImage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar el token y usuario del localStorage al iniciar
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSubject.next(token);
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success) {
            // Guardar token y usuario
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.tokenSubject.next(response.token);
            this.userSubject.next(response.user);
            
            // Redirigir según el rol
            this.redirectBasedOnRole(response.user.role);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUser(): any {
    return this.userSubject.value;
  }

  getClientId(): number | null {
    const user = this.getUser();
    return user?.clientId || null;
  }

  getRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  getVideoUrl(): Observable<VideoUrlResponse> {
    return this.http.get<VideoUrlResponse>(`${this.apiUrl}/auth/video-url`);
  }

  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/game-results']);
        break;
      case 'client':
        this.router.navigate(['/video']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
} 