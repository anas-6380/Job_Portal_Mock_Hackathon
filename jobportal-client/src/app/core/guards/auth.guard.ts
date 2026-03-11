import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn && allowedRoles.includes(authService.userRole)) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  };
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    return true;
  }
  // Redirect logged-in users to their dashboard
  const role = authService.userRole;
  if (role === 'Admin') router.navigate(['/admin']);
  else if (role === 'Employer') router.navigate(['/employer']);
  else router.navigate(['/candidate']);
  return false;
};
