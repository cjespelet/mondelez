import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { ViewChild, ElementRef } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { HttpClient } from '@angular/common/http';
import { GameConfigService } from '../../services/game-config.service';

@Component({
  selector: 'app-video-background',
  templateUrl: './video-background.component.html',
  styleUrls: ['./video-background.component.scss']
})
export class VideoBackgroundComponent implements OnInit {
  videoUrl: SafeResourceUrl | null = null;
  transitionImageUrl: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  showTransitionImage: boolean = false;
  private serverBaseUrl: string;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLIFrameElement>;
  latestReportUrl: string | null = null;
  showAccessModal: boolean = false;
  accessUsername: string = '';
  accessPassword: string = '';
  accessLoading: boolean = false;
  accessError: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private reportService: ReportService,
    private http: HttpClient,
    private gameConfigService: GameConfigService
  ) {
    // Extraer la URL base del servidor sin /api
    this.serverBaseUrl = environment.apiUrl.replace('/api', '');
  }

  ngOnInit() {
    
    this.loadVideo();
    this.loadLatestReport();
  }

  loadVideo() {
    const clientId = this.authService.getClientId();
    if (clientId) {
      this.authService.getVideoUrl().subscribe({
        next: (response) => {
          if (response.success && response.videoUrl) {
            const videoId = this.getVideoId(response.videoUrl);
            if (videoId) {
              const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&controls=0&playlist=${videoId}&enablejsapi=1&rel=0&showinfo=0&modestbranding=1`;
              this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
              // Construir la URL completa usando la URL base del servidor sin /api
              this.transitionImageUrl = response.transitionImage 
                ? `${this.serverBaseUrl}${response.transitionImage}`
                : 'assets/images/transition.png';
              this.loading = false;
            } else {
              this.error = 'URL de video inválida';
              this.loading = false;
            }
          } else {
            this.error = 'No se pudo cargar el video';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading video:', err);
          this.error = 'Error al cargar el video';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se encontró el ID del cliente';
      this.loading = false;
    }
  }

  private getVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private loadLatestReport() {
    const clientId = this.authService.getClientId();
    if (!clientId) return;
    this.reportService.getReports(clientId, 1, 1).subscribe({
      next: (res) => {
        const first = res.data && res.data.length ? res.data[0] : null;
        this.latestReportUrl = first ? first.url : null;
      },
      error: () => {
        this.latestReportUrl = null;
      }
    });
  }

  openLatestReport() {
    if (!this.latestReportUrl) return;
    this.accessError = null;
    this.accessUsername = '';
    this.accessPassword = '';
    this.showAccessModal = true;
  }

  closeAccessModal() {
    if (this.accessLoading) return;
    this.showAccessModal = false;
  }

  confirmAccess() {
    if (!this.accessUsername || !this.accessPassword || !this.latestReportUrl) {
      this.accessError = 'Usuario y contraseña son requeridos';
      return;
    }
    this.accessLoading = true;
    this.accessError = null;
    const ok = this.accessUsername === 'mdlz' && this.accessPassword === '123456';
    setTimeout(() => {
      this.accessLoading = false;
      if (ok) {
        window.open(this.latestReportUrl as string, '_blank');
        this.showAccessModal = false;
      } else {
        this.accessError = 'Credenciales inválidas o sin permiso';
      }
    }, 200);
  }


  goToGame() {
    const clientId = this.authService.getClientId();
    if (!clientId) {
      this.router.navigate(['/game-selection']);
      return;
    }

    this.gameConfigService.getClientGames(clientId).subscribe({
      next: (response) => {
        if (response.success && response.games.length === 1) {
          // Si solo tiene un juego, ir directo
          const game = response.games[0];
          if (game.name === 'tapadita') {
            this.router.navigate(['/game']);
          } else if (game.name === 'ruleta') {
            this.router.navigate(['/wheel-game']);
          } else {
            this.router.navigate(['/game-selection']);
          }
        } else {
          // Si tiene más de un juego o ninguno, ir a selección
          this.router.navigate(['/game-selection']);
        }
      },
      error: () => {
        // En caso de error, ir a selección
        this.router.navigate(['/game-selection']);
      }
    });
  }
} 