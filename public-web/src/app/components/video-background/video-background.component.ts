import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { ViewChild, ElementRef } from '@angular/core';

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

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    // Extraer la URL base del servidor sin /api
    this.serverBaseUrl = environment.apiUrl.replace('/api', '');
  }

  ngOnInit() {
    
    this.loadVideo();
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

  goToGame() {
    // this.showTransitionImage = true;
    const iframe = this.videoPlayer?.nativeElement;
    // if (iframe && iframe.contentWindow) {
    //   iframe.contentWindow.postMessage(
    //     JSON.stringify({
    //       event: 'command',
    //       func: 'stopVideo',
    //       args: []
    //     }),
    //     '*'
    //   );
    // }
    
    // // this.videoUrl = ''
    // setTimeout(() => {
      this.router.navigate(['/game']);
    // }, 6000);
  }
} 