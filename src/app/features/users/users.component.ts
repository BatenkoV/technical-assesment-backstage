import { Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { UsersService } from './services/users.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { UsersTilesViewComponent } from './components/users-tiles-view/users-tiles-view.component';
import { IUsersResponse } from './shared/interfaces/users.interface';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { UtilsService } from '../../utils/utils.service';
import { UsersStateService } from './services/user-state.service';

@Component({
  selector: 'app-users',
  imports: [
    UsersTilesViewComponent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  private readonly usersStateService = inject(UsersStateService);
  private readonly utilsService = inject(UtilsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  public deletingUserId = signal<number | null>(null);
  public searchControl = new FormControl<string>('', { nonNullable: true });

  public readonly searchQuery = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  private readonly usersResponse = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(350),
      distinctUntilChanged(),
      switchMap((searchValue: string) => {
        const value = searchValue.trim();

        return value
          ? this.usersService.searchUser(value)
          : this.usersService.getAvailableUsers();
      }),
      takeUntilDestroyed(this.destroyRef),
    ),
    {
      initialValue: {
        users: [],
        total: 0,
        skip: 0,
        limit: 0,
      },
    }
  );

  public readonly filteredUsers = computed<IUsersResponse>(() =>
    this.usersStateService.mergeWithApiUsers(this.usersResponse(), this.searchQuery())
  );

  public createNewUser(): void {
    this.router.navigate(['/users/new']);
  }

  public removeUser(userId: number): void {
    if (this.deletingUserId()) {
      return;
    }

    if (this.usersStateService.isCreatedUser(userId)) {
      this.usersStateService.removeCreatedUser(userId);
      this.utilsService.showSnackBar('User deleted successfully');
      return;
    }

    this.deletingUserId.set(userId);

    this.usersService.deleteUser(userId).pipe(
      tap(() => {
        this.usersStateService.markDeleted(userId);
        this.utilsService.showSnackBar('User deleted successfully');
      }),
      catchError(() => {
        this.utilsService.showSnackBar('Failed to delete user');
        return EMPTY;
      }),
      finalize(() => {
        this.deletingUserId.set(null);
      }),
    ).subscribe();
  }
}
