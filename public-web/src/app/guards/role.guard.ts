import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getRole();

    if (userRole === expectedRole) {
      return true;
    }

    // Redirigir según el rol del usuario
    if (userRole === 'admin') {
      this.router.navigate(['/game-results']);
    } else if (userRole === 'client') {
      this.router.navigate(['/video']);
    } else {
      this.router.navigate(['/login']);
    }

    return false;
  }
} 