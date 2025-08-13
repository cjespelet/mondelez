import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service'
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.component.html',
  styleUrls: ['./memory-game.component.scss']
})
export class MemoryGameComponent implements OnInit, OnDestroy {
  cards: any[] = [];
  gameStarted: boolean = true;
  selectedCard: number | null = null;
  winningCard: number = 0;
  showMessage: boolean = false;
  message: string = '';
  messageType: 'win' | null = null;
  totalCards: number = 9; // Número total de cartas
  columns: number = 4; // Se calcula como totalCards / 3
  showPlayAgain: boolean = false;
  canClickCards: boolean = true;
  phoneNumber: string = '';
  phoneSubmitted: boolean = false;
  transitionImageUrl: string | null = null;
  private serverBaseUrl: string;
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 1200000; // 2 minutos en milisegundos

  constructor(
    private gameService: GameService,
    private router: Router,
    private authService: AuthService
  ) {
    this.serverBaseUrl = environment.apiUrl.replace('/api', '');
  }

  ngOnInit() {
    this.loadTransitionImage();
    this.initializeGame();
    this.startInactivityTimer();
    // Agregar event listeners para detectar actividad
    window.addEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.addEventListener('keydown', this.resetInactivityTimer.bind(this));
    window.addEventListener('click', this.resetInactivityTimer.bind(this));
    window.addEventListener('touchstart', this.resetInactivityTimer.bind(this));
  }

  ngOnDestroy() {
    // Limpiar event listeners y timer al destruir el componente
    window.removeEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.removeEventListener('keydown', this.resetInactivityTimer.bind(this));
    window.removeEventListener('click', this.resetInactivityTimer.bind(this));
    window.removeEventListener('touchstart', this.resetInactivityTimer.bind(this));
    this.clearInactivityTimer();
  }

  private startInactivityTimer() {
    this.inactivityTimer = setTimeout(() => {
      this.router.navigate(['/video']);
    }, this.INACTIVITY_TIMEOUT);
  }

  private resetInactivityTimer() {
    this.clearInactivityTimer();
    this.startInactivityTimer();
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  initializeGame() {
    this.columns = Math.ceil(this.totalCards / 3);
    this.cards = Array(this.totalCards).fill({ flipped: false, isWinner: false });
    this.winningCard = Math.floor(Math.random() * this.totalCards);
    console.log(this.winningCard);
    this.cards[this.winningCard] = { ...this.cards[this.winningCard], isWinner: true };
    this.showPlayAgain = false;
    this.showMessage = false;
    this.messageType = null;
    this.canClickCards = true;
    this.resetInactivityTimer(); // Reiniciar el timer al inicializar el juego
  }

  // startGame() {
  //   this.gameStarted = true;
  //   this.initializeGame();
  //   this.resetInactivityTimer();
  // }

  flipCard(index: number) {
    if (!this.gameStarted || this.cards[index].flipped || !this.canClickCards) return;

    this.resetInactivityTimer(); // Reiniciar el timer al interactuar con una carta

    // Deshabilitar clics en otras cartas
    this.canClickCards = false;

    // Voltear solo la carta seleccionada
    this.cards[index] = { ...this.cards[index], flipped: true };
    this.selectedCard = index;

    if (this.cards[index].isWinner) {
      this.showWinMessage();
    } else {
      this.revealAllCards();
      // Después de 2 segundos, voltear todas las cartas
      // setTimeout(() => {
      //   this.revealAllCards();
      //   // Después de 6 segundos, reiniciar el juego
      //   setTimeout(() => {
      //     this.resetGame();
      //   }, 6000);
      // }, 2000);
    }
  }

  showWinMessage() {
    this.message = '¡Felicidades! Has encontrado la carta ganadora.';
    this.messageType = 'win';
    this.showMessage = true;
    this.phoneSubmitted = false;

    
  }

  revealAllCards() {
    this.cards = this.cards.map(card => ({ ...card, flipped: true }));
    this.showMessage = true;
    this.message = '¡Sigue intentando!';
    this.messageType = null;
    this.phoneSubmitted = false;
  }

  submitPhone(form: NgForm) {
    console.log('Form submitted', form);
    console.log('Phone number:', this.phoneNumber);
    console.log('Form valid:', form.valid);
    
      const clientId = this.authService.getClientId();
      if (clientId) {
        console.log('Saving game result...');
        this.gameService.saveGameResult({
          clientId: clientId.toString(),
          result: this.messageType === 'win' ? 'Ganado' : 'Perdido',
          phoneNumber: this.phoneNumber,
          date: new Date().toISOString()
        }).subscribe({
          next: () => {
            console.log('Game result saved successfully');
            this.phoneSubmitted = true;
            this.phoneNumber = '';
            setTimeout(() => {
              this.closeM();
            }, 2000);
          },
          error: (error) => {
            console.error('Error al guardar el resultado:', error);
          }
        });
      }
    
  }

  closeMessage() {
    this.showMessage = false;

    const clientId = this.authService.getClientId();
      if (clientId) {
        console.log('Saving game result...');
        this.gameService.saveGameResult({
          clientId: clientId.toString(),
          result:  'Perdido',
          phoneNumber: '0000000000',
          date: new Date().toISOString()
        }).subscribe({
          next: () => {
            console.log('Game result saved successfully');
            this.phoneSubmitted = true;
            this.phoneNumber = '';
            setTimeout(() => {
              this.closeM();
            }, 2000);
          },
          error: (error) => {
            console.error('Error al guardar el resultado:', error);
          }
        });
      }


  }
  closeM() {
    this.showMessage = false;
    this.router.navigate(['/video']);
    this.resetGame();
  }
  resetGame() {
    this.initializeGame();
    this.phoneSubmitted = false;
    this.phoneNumber = '';
  }

  loadTransitionImage() {
    const clientId = this.authService.getClientId();
    if (clientId) {
      this.authService.getVideoUrl().subscribe({
        next: (response) => {
          if (response.success && response.transitionImage) {
            this.transitionImageUrl = `${this.serverBaseUrl}${response.transitionImage}`;
          }
        },
        error: (err) => {
          console.error('Error loading transition image:', err);
        }
      });
    }
  }
} 