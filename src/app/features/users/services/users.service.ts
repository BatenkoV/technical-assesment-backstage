import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser, IUserPayload, IUsersResponse } from '../shared/interfaces/users.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly url = 'https://dummyjson.com';
  private readonly httpClient = inject(HttpClient);

  public getAvailableUsers(): Observable<IUsersResponse> {
    return this.httpClient.get<IUsersResponse>(`${this.url}/users`);
  }

  public getSpecificUserById(userId: number): Observable<IUser> {
    return this.httpClient.get<IUser>(`${this.url}/users/${userId}`);
  }

  public searchUser(searchValue: string): Observable<IUsersResponse> {
    return this.httpClient.get<IUsersResponse>(`${this.url}/users/search?q=${searchValue}`);
  }

  public createNewUser(payload: IUserPayload): Observable<IUser> {
    return this.httpClient.post<IUser>(`${this.url}/users/add`, payload);
  }

  public deleteUser(userId: number): Observable<{ isDeleted: boolean; id: number }> {
    return this.httpClient.delete<{ isDeleted: boolean; id: number }>(`${this.url}/users/${userId}`);
  }

  public updateUser(payload: IUserPayload, userId: number): Observable<IUser> {
    return this.httpClient.put<IUser>(`${this.url}/users/${userId}`, payload);
  }
}
