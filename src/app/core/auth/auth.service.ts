import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = '/api/auth';
  private readonly STORAGE_KEY = 'brp_auth_session';

  private readonly sessionState = signal<AuthResponse | null>(
    this.restoreSession()
  );

  readonly currentUser = this.sessionState.asReadonly();

  readonly isAuthenticated = computed(() => {
    const session = this.sessionState();
    return !!session?.accessToken && !this.isTokenExpired(session.accessToken);
  });

  readonly userRole = computed(() => this.sessionState()?.role ?? null);

  readonly userModules = computed(() => this.sessionState()?.modules ?? []);

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API_URL}/login`,
      credentials
    ).pipe(
      tap(response => {
        sessionStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(response)
        );

        this.sessionState.set(response);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.sessionState.set(null);
  }

  getAccessToken(): string | null {
    const session = this.sessionState();

    if (!session?.accessToken) {
      return null;
    }

    if (this.isTokenExpired(session.accessToken)) {
      this.logout();
      return null;
    }

    return session.accessToken;
  }

  hasModule(moduleName: string): boolean {
    return this.userModules().includes(moduleName);
  }

  private restoreSession(): AuthResponse | null {
    const storedSession = sessionStorage.getItem(this.STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as AuthResponse;

      if (!session.accessToken || this.isTokenExpired(session.accessToken)) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return true;
      }

      const normalized = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decoded = JSON.parse(atob(normalized));

      if (typeof decoded.exp !== 'number') {
        return true;
      }

      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  getCurrentUserId(): number | null {
  return this.currentUser()?.userId ?? null;
}

}