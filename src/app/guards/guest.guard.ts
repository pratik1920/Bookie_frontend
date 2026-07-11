import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (authSession.isAuthenticated()) {
    return router.createUrlTree(['/browse']);
  }

  return true;
};
