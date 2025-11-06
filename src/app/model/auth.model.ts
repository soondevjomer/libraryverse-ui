export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: Token;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  token: Token;
}

export interface RegisterRequest {
  role: Role;
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface UserClaim {
  sub: string; // user id / username
  role: Role;
  libraryId?: string;
libraryName?: string;
  userId?: string | number;
  name: string;
  username: string;
  exp?: number;
  iat?: number;
  customerId: string | number;
  address?: string;
  contactNumber?: string;
  email: string;
  image?: string;
  imageThumbnail?: string;
}

export enum Role {
  Librarian = 'LIBRARIAN',
  Reader = 'READER',
  Guest = 'GUEST',
}

export enum FormMode {
  Edit = 'EDIT',
  Add = 'ADD',
  Copy = 'COPY',
}
