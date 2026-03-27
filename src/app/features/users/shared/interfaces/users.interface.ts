export type UserFormControlName = 'firstName' | 'lastName' | 'university' | 'email';

export interface IUsersResponse {
  users: IUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface IUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
}

export interface IUsers {
  limit: number;
  skip: number;
  total: number;
  users: IUser[];
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  image: any;
}
