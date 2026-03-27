import { Component, inject, input, output } from '@angular/core';
import { IUsers } from '../../shared/interfaces/users.interface';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-users-tiles-view',
  imports: [
    MatCard,
    MatCardTitle,
    MatTooltip,
  ],
  templateUrl: './users-tiles-view.component.html',
  styleUrl: './users-tiles-view.component.scss'
})

export class UsersTilesViewComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  public users = input<IUsers>();
  public deletingUserId = input<number | null>();
  public deleteUser = output<number>();

  public defaultImageUrl = '../assets/images/default-image.png';
  public userActions = [
    { action: 'addToFavorite', authRequired: true },
    { action: 'edit' },
    { action: 'delete' },
  ];

  public actionEvent(userId: number, event: { action: string; authRequired?: boolean }): void {
    switch (event.action) {
      case 'addToFavorite': {
        if (!this.authService.isLoggedIn()) {
          return;
        }
        this.authService.toggleFavorite(userId);
        break;
      }

      case 'edit': {
        this.router.navigate([`users/${userId}/edit`]);
        break;
      }

      case 'delete': {
        this.openDeleteDialog(userId);
        break;
      }
    }
  }

  public getActionIcon(action: string, userId: number): string {
    switch (action) {
      case 'addToFavorite':
        return this.authService.isFavorite(userId)
          ? 'fa-solid fa-bookmark'
          : 'fa-regular fa-bookmark';

      case 'edit':
        return 'fa-solid fa-pencil';

      case 'delete':
        return 'fa-solid fa-trash';

      default:
        return '';
    }
  }

  private openDeleteDialog(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete user',
        message: `Are you sure you want to delete user with id ${userId}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed()
      .pipe(
        filter(Boolean),
        tap(() => {
          this.authService.removeFromFavorites(userId);
          this.deleteUser.emit(userId);
        })
      )
      .subscribe();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultImageUrl;
  }
}
