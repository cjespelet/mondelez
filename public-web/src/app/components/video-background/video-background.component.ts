import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-background',
  templateUrl: './video-background.component.html',
  styleUrls: ['./video-background.component.scss']
})
export class VideoBackgroundComponent implements OnInit {
  videoUrl: SafeResourceUrl | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

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
    this.router.navigate(['/game']);
  }
} 