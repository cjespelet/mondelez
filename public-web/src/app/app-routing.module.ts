import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { MemoryGameComponent } from './components/memory-game/memory-game.component';
import { LoginComponent } from './components/login/login.component';
import { VideoBackgroundComponent } from './components/video-background/video-background.component';
import { GameResultsComponent } from './components/game-results/game-results.component';
import { ClientsComponent } from './components/clients/clients.component';
import { DistributorsComponent } from './components/distributors/distributors.component';
import { ReportsListComponent } from './components/reports-list/reports-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'game-results', 
    component: GameResultsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'clients', 
    component: ClientsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'clients/:id/reports',
    component: ReportsListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'distributors', 
    component: DistributorsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'video', 
    component: VideoBackgroundComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  { 
    path: 'game', 
    component: MemoryGameComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 