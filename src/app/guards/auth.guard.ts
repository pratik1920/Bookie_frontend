import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (authSession.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
};
