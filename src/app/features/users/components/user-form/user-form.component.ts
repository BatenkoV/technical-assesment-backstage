import { Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, EMPTY, finalize, tap } from 'rxjs';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { UsersService } from '../../services/users.service';
import { UtilsService } from '../../../../utils/utils.service';
import { UsersStateService } from '../../services/user-state.service';
import { IUser, UserFormControlName } from '../../shared/interfaces/users.interface';


@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
  private readonly usersStateService = inject(UsersStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly utilsService = inject(UtilsService);

  public isLoading = false;

  public readonly userId = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        return Number(params.get('id')) || null;
      })
    ),
    { initialValue: null }
  );

  public readonly isEditMode = computed(() => this.userId() !== null);

  public userForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    university: new FormControl('', {
      nonNullable: true
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
  });

  public formFields: { controlName: UserFormControlName; label: string; type?: string }[] = [
    { controlName: 'firstName', label: 'First name', type: 'text' },
    { controlName: 'lastName', label: 'Last name', type: 'text' },
    { controlName: 'university', label: 'University', type: 'text' },
    { controlName: 'email', label: 'Email', type: 'email' },
  ];

  public constructor() {
    effect(() => {
      const id = this.userId();

      if (!id) {
        this.userForm.reset({
          firstName: '',
          lastName: '',
          university: '',
          email: '',
        });
        return;
      }

      this.loadUser(id);
    });
  }

  public submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.utilsService.showSnackBar('Please fill in all required fields of the form');
      return;
    }

    if (this.isEditMode()) {
      this.updateUser();
      return;
    }

    this.createUser();
  }

  private loadUser(userId: number): void {
    const numericUserId = Number(userId);
    const localUser = this.usersStateService.getMergedUserById(numericUserId);

    if (localUser) {
      this.patchForm(localUser);
      return;
    }

    this.isLoading = true;

    this.usersService.getSpecificUserById(userId).pipe(
      tap(user => {
        const mergedUser = this.usersStateService.getMergedUserById(user.id, user);

        if (!mergedUser) {
          this.utilsService.showSnackBar('User not found');
          this.router.navigate(['/users']);
          return;
        }

        this.patchForm(mergedUser);
      }),
      catchError(() => {
        this.utilsService.showSnackBar('Failed to load user');
        this.router.navigate(['/users/new']);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe();
  }

  private createUser(): void {
    this.isLoading = true;

    this.usersService.createNewUser(this.userForm.getRawValue()).pipe(
      tap(createdUser => {
        this.usersStateService.addCreatedUser(createdUser);
        this.utilsService.showSnackBar('User created successfully');
        this.router.navigate(['/users']);
      }),
      catchError(() => {
        this.utilsService.showSnackBar('Failed to create user');
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe();
  }

  private updateUser(): void {
    const id = this.userId();

    if (!id) {
      return;
    }

    const payload = this.userForm.getRawValue();

    if (this.usersStateService.isCreatedUser(id)) {
      this.usersStateService.updateCreatedUser(id, payload);
      this.utilsService.showSnackBar('User updated successfully');
      this.router.navigate(['/users']);
      return;
    }

    this.isLoading = true;

    this.usersService.updateUser(payload, id).pipe(
      tap(updatedUser => {
        this.usersStateService.setUpdatedUser(updatedUser);
        this.utilsService.showSnackBar('User updated successfully');
        this.router.navigate(['/users']);
      }),
      catchError(() => {
        this.utilsService.showSnackBar('Failed to update user');
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe();
  }


  private patchForm(user: IUser): void {
    this.userForm.patchValue({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      university: user.university ?? '',
      email: user.email ?? '',
    });
  }
}
