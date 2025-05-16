import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      position: relative;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'memory-game';
  isAuthenticated: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
    
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
    }
  }
} 