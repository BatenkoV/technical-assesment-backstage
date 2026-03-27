import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormField, MatInput, MatButtonModule, MatLabel],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  public submit(): void {
    const { email } = this.form.controls;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login({
      email: email.value,
      favoriteUserIds: [],
    });

    this.router.navigate(['/users']);
  }
}
