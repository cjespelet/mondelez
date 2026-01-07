import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GameConfigService, Game } from '../../services/game-config.service';

@Component({
  selector: 'app-game-selection',
  templateUrl: './game-selection.component.html',
  styleUrls: ['./game-selection.component.scss']
})
export class GameSelectionComponent implements OnInit {
  availableGames: Game[] = [];
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private gameConfigService: GameConfigService
  ) {}

  ngOnInit() {
    this.loadClientGames();
  }

  loadClientGames() {
    const clientId = this.authService.getClientId();
    if (!clientId) {
      return;
    }

    this.loading = true;
    this.gameConfigService.getClientGames(clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableGames = response.games;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openTapadita() {
    this.router.navigate(['/game']);
  }

  openRuleta() {
    this.router.navigate(['/wheel-game']);
  }

  hasGame(gameName: string): boolean {
    return this.availableGames.some(g => g.name === gameName);
  }
}


