export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  role: string;
  modules: string[];
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}