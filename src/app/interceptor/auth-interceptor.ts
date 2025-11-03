import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../service/auth-service';
import { Token } from '../model/auth.model';
import { Router } from '@angular/router';
import { log, error } from '@/utils/logger';

const refreshTokenSubject$ = new BehaviorSubject<string | null>(null);
let isRefreshing = false;

/** Check if a request is public and should skip attaching auth */
function isPublicEndpoint(req: HttpRequest<unknown>): boolean {
  const path = new URL(req.url, window.location.origin).pathname;
  const method = req.method.toUpperCase();

  log('%c[AuthInterceptor] Checking endpoint:', 'color: cyan', path, 'Method:', method);

  /** Publicly accessible endpoints */
  const publicEndpoints = [
    { pattern: '/auth/login', methods: ['ALL'] },
    { pattern: '/auth/register', methods: ['ALL'] },
    { pattern: '/auth/refresh-token', methods: ['ALL'] },
    { pattern: '/libraries', methods: ['GET'] },
    { pattern: '/libraries/:libraryId', methods: ['GET'] },
    { pattern: '/books', methods: ['GET'] },
    { pattern: '/books/:bookId', methods: ['GET'] },
    { pattern: '/genres', methods: ['GET'] },
    { pattern: '/files', methods: ['GET'] },
    { pattern: '/profile/check-email', methods: ['POST'] },
    { pattern: '/profile/check-username', methods: ['POST'] },
  ];

  /** Secure endpoints that should NEVER be treated as public */
  const securePatterns = [
    /^\/books\/page(?:$|\/)/,
    /^\/books\/search(?:$|\/)/,
    /^\/books\/edit(?:$|\/)/,
    /^\/books\/copy(?:$|\/)/,
    /^\/books\/library(?:$|\/)/,
    /^\/books\/create(?:$|\/)/,
    /^\/libraries\/stats(?:$|\/)/,
    /^\/profile\/(?:$|\/)/,
    /^\/storeOrders\/stat(?:$|\/)/,
    /^\/uploads\/(?:$|\/)/,
    /^\/orders\/(?:$|\/)/,
  ];

  // If it matches any secure pattern → always private
  if (securePatterns.some(r => r.test(path))) {
    log('%c[AuthInterceptor] Matched secure pattern → PRIVATE', 'color: red', path);
    return false;
  }

  // Otherwise check if it's in the public list
  const isPublic = publicEndpoints.some(e => {
    const matchesPath = patternToRegex(e.pattern).test(path);
    const matchesMethod = e.methods.includes('ALL') || e.methods.includes(method);
    return matchesPath && matchesMethod;
  });

  log(
    `%c[AuthInterceptor] Result → ${isPublic ? 'PUBLIC' : 'PRIVATE'}`,
    `color: ${isPublic ? 'green' : 'red'}`,
    path
  );

  return isPublic;
}

/** Converts "/books/:bookId" into a proper RegExp */
function patternToRegex(pattern: string): RegExp {
  return new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
}

/** Main interceptor logic */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip if endpoint is public
  if (isPublicEndpoint(req)) {
    return next(req);
  }

  const accessToken = authService.accessTokenValue;
  let authReq = req;

  // Attach access token if valid
  if (accessToken && !authService.isTokenExpired(accessToken)) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(authReq).pipe(
    catchError((httpError: HttpErrorResponse) => {
      if (httpError.status === 401) {
        log('%c[AuthInterceptor] 401 detected → trying refresh', 'color: orange');

        // Only refresh once at a time
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject$.next(null);

          return authService.refreshToken().pipe(
            switchMap((token: Token) => {
              log('%c[AuthInterceptor] Token refresh success', 'color: green');
              isRefreshing = false;
              authService.updateToken(token);
              refreshTokenSubject$.next(token.accessToken);

              // Retry original request
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token.accessToken}` },
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              error('[AuthInterceptor] Refresh failed', refreshError);
              isRefreshing = false;
              refreshTokenSubject$.next(null);
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // Wait for ongoing refresh
          return refreshTokenSubject$.pipe(
            filter(token => !!token),
            take(1),
            switchMap(token => {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
              });
              return next(retryReq);
            })
          );
        }
      }

      // Pass through all other errors
      return throwError(() => httpError);
    })
  );
};
