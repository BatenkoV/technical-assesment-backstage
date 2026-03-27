import { Injectable, signal } from '@angular/core';
import { IUser, IUserPayload, IUsersResponse } from '../shared/interfaces/users.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersStateService {
  public createdUsers = signal<IUser[]>([]);
  public updatedUsers = signal<Record<number, IUser>>({});
  public deletedUserIds = signal<number[]>([]);

  public addCreatedUser(user: IUser): void {
    this.createdUsers.update(users => [user, ...users]);
  }

  public setUpdatedUser(user: IUser): void {
    this.updatedUsers.update(usersMap => ({
      ...usersMap,
      [user.id]: user,
    }));
  }

  public markDeleted(userId: number): void {
    if (!this.deletedUserIds().includes(userId)) {
      this.deletedUserIds.update(ids => [...ids, userId]);
    }

    this.createdUsers.update(users => users.filter(user => user.id !== userId));

    this.updatedUsers.update(usersMap => {
      const updatedMap = { ...usersMap };
      delete updatedMap[userId];
      return updatedMap;
    });
  }

  public isDeleted(userId: number): boolean {
    return this.deletedUserIds().includes(userId);
  }

  public getUpdatedUser(userId: number): IUser | undefined {
    return this.updatedUsers()[userId];
  }

  public getCreatedUser(userId: number): IUser | undefined {
    return this.createdUsers().find(user => user.id === userId);
  }

  public getMergedUserById(userId: number, apiUser?: IUser | null): IUser | null {
    const createdUser = this.getCreatedUser(userId);
    const updatedUser = this.getUpdatedUser(userId);

    if (this.isDeleted(userId)) return null;

    if (createdUser) return createdUser;

    if (updatedUser) return updatedUser;

    return apiUser ?? null;
  }

  public isCreatedUser(userId: number): boolean {
    return this.createdUsers().some(user => user.id === userId);
  }

  public removeCreatedUser(userId: number): void {
    this.createdUsers.update(users => users.filter(user => user.id !== userId));

    this.updatedUsers.update(usersMap => {
      const updatedMap = { ...usersMap };
      delete updatedMap[userId];
      return updatedMap;
    });

    this.deletedUserIds.update(ids => ids.filter(id => id !== userId));
  }

  public updateCreatedUser(userId: number, payload: IUserPayload): void {
    this.createdUsers.update(users =>
      users.map(user =>
        user.id === userId
          ? {
            ...user,
            ...payload,
          }
          : user
      )
    );
  }

  public mergeWithApiUsers(
    response: IUsersResponse,
    searchQuery: string
  ): IUsersResponse {
    const apiUsers = response.users ?? [];
    const query = searchQuery.trim().toLowerCase();
    const deletedIds = this.deletedUserIds();
    const updatedUsersMap = this.updatedUsers();
    const createdUsers = this.createdUsers();

    const mergedApiUsers = apiUsers
      .filter(user => !deletedIds.includes(user.id))
      .map(user => updatedUsersMap[user.id] ?? user);

    const standaloneUpdatedUsers = Object.values(updatedUsersMap)
      .filter(user => !deletedIds.includes(user.id))
      .filter(user => this.matchesSearch(user, query))
      .filter(updatedUser =>
        !mergedApiUsers.some(apiUser => apiUser.id === updatedUser.id)
      )
      .filter(updatedUser =>
        !createdUsers.some(createdUser => createdUser.id === updatedUser.id)
      );

    const filteredCreatedUsers = createdUsers
      .filter(user => !deletedIds.includes(user.id))
      .filter(user => this.matchesSearch(user, query))
      .filter(createdUser => {
        return !mergedApiUsers.some(apiUser => apiUser.id === createdUser.id)
          && !standaloneUpdatedUsers.some(updatedUser => updatedUser.id === createdUser.id);
      });

    const users = [...filteredCreatedUsers, ...standaloneUpdatedUsers, ...mergedApiUsers];

    return {
      users,
      total: users.length,
      skip: response.skip,
      limit: response.limit,
    };
  }

  private matchesSearch(user: IUser, query: string): boolean {
    if (!query) {
      return true;
    }

    return [
      user.firstName,
      user.lastName,
      user.email,
      user.university ?? '',
    ].some(value => value.toLowerCase().includes(query));
  }
}
