import { Routes } from '@angular/router';
import { UsersComponent } from './features/users/users.component';
import { UserFormComponent } from './features/users/components/user-form/user-form.component';
import { LoginComponent } from './features/login/login.component';
import {authGuard} from './features/users/shared/guards/auth-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersComponent },
  { path: 'users/new', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/:id/edit', component: UserFormComponent, canActivate: [authGuard] },
];
