export interface AuthUser {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}

export interface AuthLoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}
