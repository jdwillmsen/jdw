import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Environment,
  ENVIRONMENT,
  getErrorMessage,
} from '@jdw/angular-shared-util';
import { catchError, Observable, of } from 'rxjs';
import {
  ComponentRemote,
  NavigationItem,
  RouteRemote,
} from '@jdw/angular-container-util';
import { SnackbarService } from '@jdw/angular-shared-data-access';

@Injectable({
  providedIn: 'root',
})
export class MicroFrontendService {
  private http: HttpClient = inject(HttpClient);
  private environment: Environment = inject(ENVIRONMENT);
  private snackbarService: SnackbarService = inject(SnackbarService);

  getRouteRemotes(): Observable<RouteRemote[]> {
    return this.http
      .get<
        RouteRemote[]
      >(`${this.environment.SERVICE_DISCOVERY_BASE_URL}/api/route-remotes`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getComponentRemotes(): Observable<ComponentRemote[]> {
    return this.http
      .get<
        ComponentRemote[]
      >(`${this.environment.SERVICE_DISCOVERY_BASE_URL}/api/component-remotes`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getNavigationItems(): Observable<NavigationItem[]> {
    return this.http
      .get<
        NavigationItem[]
      >(`${this.environment.SERVICE_DISCOVERY_BASE_URL}/api/navigation-items`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  handleError(error: HttpErrorResponse) {
    const errorMessage = getErrorMessage(error);
    this.snackbarService.error(
      errorMessage,
      {
        variant: 'filled',
        autoClose: false,
      },
      true,
    );
    return of([]);
  }
}
