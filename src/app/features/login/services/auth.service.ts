import {computed, Injectable, signal} from '@angular/core';

export interface IAuthorizedUser {
  email: string;
  favoriteUserIds: number[];
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public currentUser = signal<IAuthorizedUser | null>(null);

  public isLoggedIn = computed(() => !!this.currentUser());

  public login(user: IAuthorizedUser): void {
    this.currentUser.set(user);
    localStorage.setItem('authorizedUser', JSON.stringify(user));
  }

  public logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('authorizedUser');
  }

  public restoreSession(): void {
    const storedUser = localStorage.getItem('authorizedUser');

    if (!storedUser) {
      return;
    }

    this.currentUser.set(JSON.parse(storedUser));
  }

  public addToFavorites(userId: number): void {
    const user = this.currentUser();

    if (!user) return;

    if (user.favoriteUserIds.includes(userId)) return;

    const updatedUser: IAuthorizedUser = {
      ...user,
      favoriteUserIds: [...user.favoriteUserIds, userId],
    };

    this.currentUser.set(updatedUser);
    localStorage.setItem('authorizedUser', JSON.stringify(updatedUser));
  }

  public removeFromFavorites(userId: number): void {
    const user = this.currentUser();

    if (!user) return;

    const updatedUser: IAuthorizedUser = {
      ...user,
      favoriteUserIds: user.favoriteUserIds.filter(id => id !== userId),
    };

    this.currentUser.set(updatedUser);
    localStorage.setItem('authorizedUser', JSON.stringify(updatedUser));
  }

  public isFavorite(userId: number): boolean {
    const user = this.currentUser();

    if (!user) {
      return false;
    }

    return user.favoriteUserIds.includes(userId);
  }

  public toggleFavorite(userId: number): void {
    if (this.isFavorite(userId)) {
      this.removeFromFavorites(userId);
      return;
    }

    this.addToFavorites(userId);
  }
}
