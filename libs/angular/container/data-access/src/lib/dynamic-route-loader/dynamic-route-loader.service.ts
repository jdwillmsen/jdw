import { inject, Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { MicroFrontendService } from '../micro-frontend/micro-frontend.service';
import { loadRemote, init } from '@module-federation/enhanced/runtime';
/* eslint-disable @nx/enforce-module-boundaries */
import { FallbackComponent } from '@jdw/angular-shared-ui';
/* eslint-enable @nx/enforce-module-boundaries */

@Injectable({
  providedIn: 'root',
})
export class DynamicRouteLoaderService {
  private router: Router = inject(Router);
  private mfService: MicroFrontendService = inject(MicroFrontendService);

  loadRoutes(): Promise<void> {
    return new Promise((resolve) => {
      this.mfService.getRouteRemotes().subscribe((remotes) => {
        const dynamicRoutes: Route[] = remotes.map((remote) => {
          return {
            path: remote.path,
            loadChildren: () =>
              loadRemote<any>(remote.id)
                .then((m) => m.remoteRoutes)
                .catch((err) => {
                  console.error('Failed to load remote', err);
                  return [{ path: '**', component: FallbackComponent }];
                }),
          };
        });
        dynamicRoutes.push({
          path: '**',
          redirectTo: '',
        });
        init({
          name: 'container',
          remotes: remotes,
        });
        this.router.resetConfig([...this.router.config, ...dynamicRoutes]);
        resolve();
      });
    });
  }
}
