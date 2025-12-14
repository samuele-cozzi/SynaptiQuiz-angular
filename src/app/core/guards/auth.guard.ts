import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // We check the user specific observable from angular/fire which is more reliable for 'initial load'
    return authService.user$.pipe(
        take(1),
        map(user => {
            if (user) {
                return true;
            } else {
                return router.createUrlTree(['/login']);
            }
        })
    );
};
