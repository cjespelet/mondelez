import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
  }

  navigateToResults() {
    this.router.navigate(['/game-results']);
  }

  navigateToClients() {
    this.router.navigate(['/clients']);
  }

  navigateToDistributors() {
    this.router.navigate(['/distributors']);
  }
} 