import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';
import { inject } from '@angular/core';
import { Role } from '../model/auth.model';
import { log } from '@/utils/logger';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'] as Role | undefined;
  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['forbidden']);
    return false;
  }

  const checkOwnership = route.data?.['checkOwnership'] as boolean | undefined;
  if (checkOwnership && requiredRole === Role.Librarian) {
    const libraryIdFromUrl = route.paramMap.get('libraryId');
    log('libraryfromUrl: ', libraryIdFromUrl);
    const userLibraryId = authService.userClaim?.libraryId;
    log('userLibraryId: ', userLibraryId);

    if (libraryIdFromUrl && userLibraryId) {
      if (libraryIdFromUrl !== userLibraryId.toString()) {
        router.navigate(['/forbidden']);
        return false;
      }
    }
  }

  return true;
};
