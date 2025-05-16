import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoBackgroundComponent } from './components/video-background/video-background.component';
import { MemoryGameComponent } from './components/memory-game/memory-game.component';
import { LoginComponent } from './components/login/login.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { GameResultsComponent } from './components/game-results/game-results.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { DistributorsComponent } from './components/distributors/distributors.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    VideoBackgroundComponent,
    MemoryGameComponent,
    LoginComponent,
    SafeUrlPipe,
    GameResultsComponent,
    ClientsComponent,
    AdminNavComponent,
    DistributorsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 