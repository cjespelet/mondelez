import { Component, OnDestroy, OnInit } from '@angular/core';
import { WheelGameService } from '../../services/wheel-game.service';
import { AuthService } from '../../services/auth.service';
import { GameConfigService } from '../../services/game-config.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

interface WheelSegment {
  label: string;
  prize: string;
  result: 'Ganado' | 'Perdido';
  color: string;
  icon: string;
}

@Component({
  selector: 'app-wheel-game',
  templateUrl: './wheel-game.component.html',
  styleUrls: ['./wheel-game.component.scss']
})
export class WheelGameComponent implements OnInit, OnDestroy {
  segments: WheelSegment[] = [];

  wheelGradient: string = '';
  currentRotation = 0;
  isSpinning = false;
  spinMessage: string | null = null;
  resultType: 'Ganado' | 'Perdido' | null = null;
  prizeLabel: string = '';
  phoneNumber: string = '';
  phoneSubmitted = false;
  submittingResult = false;
  savedResultId: number | null = null; // ID del resultado guardado
  error: string | null = null;
  private readonly labelRadius = 170;
  private readonly baseOffset = -90; // aligns first segment to top pointer
  private spinAudio: HTMLAudioElement | null = null;
  private tickAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private tickTimeout: any = null;
  private readonly totalSpinDuration = 4500;

  private readonly colors = ['#f94144', '#f8961e', '#f3722c', '#f9844a', '#f9c74f', '#43aa8b'];
  private readonly icons = ['fas fa-gift', 'fas fa-times-circle', 'fas fa-percent', 'fas fa-face-frown', 'fas fa-redo', 'fas fa-times-circle'];

  constructor(
    private wheelGameService: WheelGameService,
    private authService: AuthService,
    private gameConfigService: GameConfigService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClientPrizes();
  }

  loadClientPrizes() {
    const clientId = this.authService.getClientId();
    if (!clientId) {
      this.buildDefaultSegments();
      return;
    }

    this.gameConfigService.getClientPrizes(clientId).subscribe({
      next: (response) => {
        if (response.success && response.prizes.length > 0) {
          this.buildSegmentsFromPrizes(response.prizes);
        } else {
          this.buildDefaultSegments();
        }
        this.wheelGradient = this.generateGradient();
      },
      error: () => {
        this.buildDefaultSegments();
        this.wheelGradient = this.generateGradient();
      }
    });
  }

  buildSegmentsFromPrizes(prizes: any[]) {
    this.segments = [];
    
    // Capitalizar y preparar premios
    const formattedPrizes = prizes.map(p => ({
      ...p,
      description: this.capitalizeFirst(p.description)
    }));

    // Intercalar premios con "Seguí participando" hasta completar 6 segmentos
    let prizeIndex = 0;
    let segmentIndex = 0;
    
    while (this.segments.length < 6) {
      if (segmentIndex % 2 === 0 && prizeIndex < formattedPrizes.length) {
        // Posición par: agregar premio
        const prize = formattedPrizes[prizeIndex];
        this.segments.push({
          label: prize.description,
          prize: prize.description,
          result: 'Ganado',
          color: this.colors[this.segments.length % this.colors.length],
          icon: 'fas fa-gift'
        });
        prizeIndex++;
      } else {
        // Posición impar o no hay más premios: agregar "Seguí participando"
        this.segments.push({
          label: 'Seguí participando',
          prize: '',
          result: 'Perdido',
          color: this.colors[this.segments.length % this.colors.length],
          icon: 'fas fa-face-frown'
        });
      }
      segmentIndex++;
    }
  }

  private capitalizeFirst(str: string): string {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  buildDefaultSegments() {
    this.segments = [
      { label: 'Premio Sorpresa', prize: 'Premio Sorpresa', result: 'Ganado', color: '#f94144', icon: 'fas fa-gift' },
      { label: 'Sigue intentando', prize: '', result: 'Perdido', color: '#f8961e', icon: 'fas fa-times-circle' },
      { label: 'Cupón Descuento', prize: 'Cupón Descuento', result: 'Ganado', color: '#f3722c', icon: 'fas fa-percent' },
      { label: 'Sigue intentando', prize: '', result: 'Perdido', color: '#f9844a', icon: 'fas fa-face-frown' },
      { label: 'Seguí participando', prize: '', result: 'Perdido', color: '#f9c74f', icon: 'fas fa-face-frown' },
      { label: 'Sigue intentando', prize: '', result: 'Perdido', color: '#43aa8b', icon: 'fas fa-times-circle' },
    ];
  }

  private generateGradient(): string {
     const angle = 360 / this.segments.length;
    const separator = 'rgba(255,255,255,0.45)';
    const separatorWidth = 1.2; // degrees
    const gradientStops: string[] = [];

    this.segments.forEach((segment, index) => {
      const start = index * angle;
      const end = start + angle;
      const colorEnd = end - separatorWidth;
      gradientStops.push(`${segment.color} ${start}deg ${colorEnd}deg`);
      gradientStops.push(`${separator} ${colorEnd}deg ${end}deg`);
    });

    return `conic-gradient(from ${this.baseOffset}deg, ${gradientStops.join(', ')})`;
  }

  spinWheel() {
    if (this.isSpinning) return;
    this.clearResultState();

    this.isSpinning = true;
    this.playSpinSound();
    this.startTickLoop();
    
    const clientId = this.authService.getClientId();
    if (!clientId) {
      this.error = 'No se encontró el ID del cliente';
      this.isSpinning = false;
      return;
    }

    this.wheelGameService.spin(clientId).subscribe({
      next: (response) => {
        const segmentAngle = 360 / this.segments.length;
        const spins = 5;
        const currentBase = ((this.currentRotation % 360) + 360) % 360;
        const centerAngle = ((this.baseOffset + response.segmentIndex * segmentAngle + (segmentAngle / 2)) % 360 + 360) % 360;
        const desired = (360 - centerAngle) % 360;
        const delta = ((desired - currentBase) + 360) % 360;
        this.currentRotation += spins * 360 + delta;
        this.prizeLabel = response.prize;
        this.resultType = response.result;

        // Guardar el resultado inmediatamente (sin teléfono)
        this.saveResultImmediately(response);

        setTimeout(() => {
          this.isSpinning = false;
          this.stopSpinSound();
          this.stopTickLoop();
          setTimeout(() => {
            if (response.result === 'Ganado') {
              this.spinMessage = `¡Felicitaciones! Ganaste ${response.prize}`;
              this.playWinSound();
            } else {
              this.spinMessage = '¡Sigue intentando!';
            }
          }, 2000);
        }, 4500);
      },
      error: () => {
        this.stopSpinSound();
        this.stopTickLoop();
        this.isSpinning = false;
        this.submittingResult = false;
        this.spinMessage = 'Ocurrió un error al girar la ruleta. Intenta nuevamente.';
      }
    });
  }

  private saveResultImmediately(response: any) {
    const clientId = this.authService.getClientId();
    if (!clientId || !this.resultType) return;

    // Guardar resultado sin teléfono
    this.wheelGameService.saveResult({
      clientId: clientId.toString(),
      result: this.resultType,
      prize: response.prize || this.prizeLabel,
      phoneNumber: '', // Sin teléfono inicialmente
      date: new Date().toISOString(),
      gameType: 'ruleta'
    }).subscribe({
      next: (result: any) => {
        console.log('Resultado guardado:', result);
        if (result && result.id) {
          this.savedResultId = result.id;
        } else if (result && result.success && result.id) {
          this.savedResultId = result.id;
        }
      },
      error: (error) => {
        console.error('Error al guardar resultado:', error);
      }
    });
  }

  submitPhone(form: NgForm) {
    // El teléfono es opcional, si no hay teléfono, solo cerrar
    if (!this.resultType || this.submittingResult) return;
    
    // Si no hay teléfono o el formulario no es válido, solo cerrar
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      this.closeResultModal();
      return;
    }

    const clientId = this.authService.getClientId();
    if (!clientId) {
      this.closeResultModal();
      return;
    }

    this.submittingResult = true;
    
    // Si no hay savedResultId, intentar guardar de nuevo con teléfono
    if (!this.savedResultId) {
      // Guardar resultado con teléfono
      this.wheelGameService.saveResult({
        clientId: clientId.toString(),
        result: this.resultType,
        prize: this.prizeLabel,
        phoneNumber: this.phoneNumber,
        date: new Date().toISOString(),
        gameType: 'ruleta'
      }).subscribe({
        next: (result) => {
          this.phoneSubmitted = true;
          this.submittingResult = false;
          setTimeout(() => {
            this.closeResultModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al guardar resultado con teléfono:', error);
          this.phoneSubmitted = true;
          this.submittingResult = false;
          setTimeout(() => {
            this.closeResultModal();
          }, 2000);
        }
      });
    } else {
      // Actualizar el resultado con el teléfono
      this.wheelGameService.updateResultPhone(this.savedResultId, this.phoneNumber).subscribe({
        next: () => {
          this.phoneSubmitted = true;
          this.submittingResult = false;
          setTimeout(() => {
            this.closeResultModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar teléfono:', error);
          // Aún así cerrar el modal
          this.phoneSubmitted = true;
          this.submittingResult = false;
          setTimeout(() => {
            this.closeResultModal();
          }, 2000);
        }
      });
    }
  }

  closeResultModal(navigate: boolean = true) {
    if (this.submittingResult) return;
    this.stopSpinSound();
    this.stopTickLoop();
    this.stopWinSound();
    this.clearResultState();
    if (navigate) {
      this.router.navigate(['/video']);
    }
  }

  private clearResultState() {
    this.spinMessage = null;
    this.resultType = null;
    this.prizeLabel = '';
    this.phoneNumber = '';
    this.phoneSubmitted = false;
    this.savedResultId = null;
  }

  getLabelRotation(index: number): number {
    const angle = 360 / this.segments.length;
    return this.baseOffset + index * angle + angle / 2;
  }

  getLabelStyle(index: number) {
     const rotation = this.getLabelRotation(index);
     return {
      transform: `rotate(${rotation}deg) translate(0, -${this.labelRadius}px)`
    };
  }

  getLabelContentStyle(index: number) {
     const rotation = this.getLabelRotation(index);
     return {
      transform: `translate(-50%, -50%) rotate(${-rotation}deg)`
    };
  }

  ngOnDestroy(): void {
    this.stopSpinSound();
    this.stopTickLoop();
    this.stopWinSound();
  }

  private ensureSpinAudio() {
    if (!this.spinAudio) {
      this.spinAudio = this.createAudio('assets/sounds/wheel-spin.mp3', { loop: false, volume: 0.55 });
    }
    if (!this.tickAudio) {
      this.tickAudio = this.createAudio('assets/sounds/wheel-tick.mp3', { volume: 0.9 });
    }
    if (!this.winAudio) {
      this.winAudio = this.createAudio('assets/sounds/aplausos.wav', { volume: 0.6 });
    }
  }

  private createAudio(src: string, opts: { loop?: boolean; volume?: number } = {}): HTMLAudioElement | null {
    try {
      const audio = new Audio(src);
      if (typeof opts.loop !== 'undefined') {
        audio.loop = opts.loop;
      }
      if (typeof opts.volume !== 'undefined') {
        audio.volume = opts.volume;
      }
      audio.load();
      return audio;
    } catch (error) {
      console.warn('No se pudo cargar el audio', src, error);
      return null;
    }
  }

  private playSpinSound() {
    this.ensureSpinAudio();
    if (this.spinAudio) {
      this.spinAudio.currentTime = 0;
      this.spinAudio.play().catch(() => {});
      const startTime = performance.now();
      const fadeDuration = this.totalSpinDuration + 500; // suaviza el final

      const adjustVolume = (time: number) => {
        if (!this.spinAudio) return;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / fadeDuration, 1);
        const volume = 0.55 * (1 - progress);
        this.spinAudio.volume = Math.max(0, volume);
        if (progress < 1 && !this.spinAudio.paused) {
          requestAnimationFrame(adjustVolume);
        }
      };

      requestAnimationFrame(adjustVolume);
    }
  }

  private stopSpinSound() {
    if (this.spinAudio) {
      this.spinAudio.pause();
      this.spinAudio.currentTime = 0;
      this.spinAudio.volume = 0.55;
    }
  }

  private startTickLoop() {
    this.ensureSpinAudio();
    const startTime = performance.now();
    const startInterval = 70;
    const endInterval = 420;

    const tickStep = () => {
      this.playTickSound();
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / this.totalSpinDuration, 1);
      const easing = progress * progress;
      const interval = startInterval + (endInterval - startInterval) * easing;
      this.tickTimeout = setTimeout(tickStep, interval);
    };

    tickStep();
  }

  private playTickSound() {
    if (this.tickAudio) {
      this.tickAudio.currentTime = 0;
      this.tickAudio.play().catch(() => {});
    }
  }

  private stopTickLoop() {
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout);
      this.tickTimeout = null;
    }
    if (this.tickAudio) {
      this.tickAudio.pause();
      this.tickAudio.currentTime = 0;
      this.tickAudio.volume = 0.9;
    }
  }

  private playWinSound() {
    if (this.winAudio) {
      this.winAudio.currentTime = 0;
      this.winAudio.play().catch(() => {});
    }
  }

  private stopWinSound() {
    if (this.winAudio) {
      this.winAudio.pause();
      this.winAudio.currentTime = 0;
    }
  }
}


