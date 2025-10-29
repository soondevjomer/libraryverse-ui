import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LoginRequest, RegisterRequest, Role, Token, UserClaim } from '../model/auth.model';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // DEPENDENCIES
  private http = inject(HttpClient);
  private router = inject(Router);

  // CONSTANTS
  private baseUrl = environment.apiBaseUrl;

  // SIGNALS
  private _accessToken = signal<string | null>(null);
  accessToken = this._accessToken.asReadonly();
  private _userClaim = signal<UserClaim | null>(null);

  // SUBJECT
  private refreshing$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const token = JSON.parse(storedToken) as Token;
        this.setToken(token);
      } catch {
        console.error('TRYING TO SET THE TOKEN FROM STORED TOKEN FAILED');
      }
    }
    // EFFECT: WHEN TOKEN CHANGES, UPDATE CLAIMS
    effect(() => {
      console.log('TOKEN CHANGES UPDATING USER CLAIM...');
      const t = this._accessToken();
      this._userClaim.set(t ? jwtDecode<UserClaim>(t) : null);
    });
  }

  // FUNCTIONS
  private setToken(token: Token) {
    if (token.accessToken !== this.accessTokenValue) {
      console.log('SETTING THE TOKEN...');
      this._accessToken.set(token.accessToken);
      this._userClaim.set(jwtDecode<UserClaim>(token.accessToken));
      localStorage.setItem('token', JSON.stringify(token));
    }
  }
  _role = computed<Role>(() => {
    return this._userClaim()?.role ?? Role.Guest;
  });
  updateToken(token: Token) {
    this.setToken(token);
  }
  get accessTokenValue() {
    console.log('GETTING ACCESS TOKEN VALUE...');
    console.log('GETTING USER CLAIM: ', this.userClaim);
    return this._accessToken();
  }
  get userClaim(): UserClaim | null {
    return this._userClaim();
  }

  hasRole(role: Role) {
    console.log('IS USER HAS ROLE?');
    const claims = this._userClaim();
    return !!claims && claims.role === role;
  }
  // in AuthService
  isLoggedIn = computed(() => {
    const token = this._accessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  });

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  logout() {
    console.log('LOGOUT USER...');
    this._accessToken.set(null);
    this._userClaim.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // API CALL
  login(loginRequest: LoginRequest): Observable<Token> {
    console.log('LOGGING IN USER...');
    return this.http.post<Token>(`${this.baseUrl}/auth/login`, loginRequest).pipe(
      switchMap((token) => {
        console.log(jwtDecode(token.accessToken));
        this.setToken(token);
        return of(token);
      })
    );
  }
  register(registerRequest: RegisterRequest): Observable<Token> {
    console.log('REGISTERING USER...');
    return this.http.post<Token>(`${this.baseUrl}/auth/register`, registerRequest).pipe(
      switchMap((token) => {
        this.setToken(token);
        return of(token);
      })
    );
  }
  refreshToken(): Observable<Token> {
    // simple refresh flow; coordinate via refreshing$
    console.log('REFRESHING TOKEN ...');
    if (this.refreshing$.value) {
      // if already refreshing, wait until it's done and return updated token
      return this.refreshing$.pipe(
        switchMap((isRefreshing) => {
          if (!isRefreshing) {
            const storedToken = this.accessTokenValue;
            if (storedToken) return of({ accessToken: storedToken } as Token);
            return throwError(() => new Error('NO TOKEN TO REFRESH.'));
          }
          return of(null as unknown as Token);
        })
      );
    }
    this.refreshing$.next(true);
    const stored = localStorage.getItem('token');
    if (!stored) return throwError(() => new Error('NO TOKEN FROM LOCAL STORAGE'));
    const { refreshToken } = JSON.parse(stored) as Token;

    return this.http.post<Token>(`${this.baseUrl}/auth/refresh-token`, { refreshToken }).pipe(
      switchMap((token) => {
        this.setToken(token);
        this.refreshing$.next(false);
        return of(token);
      }),
      catchError((error) => {
        this.refreshing$.next(false);
        console.error('REFRESHING TOKEN ERROR', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }
}
