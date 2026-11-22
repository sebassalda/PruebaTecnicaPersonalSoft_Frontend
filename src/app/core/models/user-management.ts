export type UserRole =
  | 'ADMINISTRADOR'
  | 'RADICADOR'
  | 'ANALISTA'
  | 'JEFE';

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  role: string;
  activo: boolean;
  modules: string[];
}

export interface CreateUserRequest {
  nombre: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  activo: boolean;
}

export interface UpdateUserModulesRequest {
  modules: string[];
}