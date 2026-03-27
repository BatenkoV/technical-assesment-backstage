import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {AuthService} from './features/login/services/auth.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);
  public authService = inject(AuthService);

  public isLoggedIn = this.authService.isLoggedIn;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  public isLoginPage = computed(() => this.currentUrl() === '/login');

  public constructor() {
    this.authService.restoreSession();
  }

  public navigateToLogin(): void {
    this.router.navigate(['login']);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
