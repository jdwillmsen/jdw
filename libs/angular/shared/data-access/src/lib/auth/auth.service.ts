import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  CreateUserRequest,
  getErrorMessage,
  INVALID_SIGN_IN_MESSAGE,
  LoginUserRequest,
  SUCCESS_SIGN_UP_MESSAGE,
  SUCCESS_SIGN_IN_MESSAGE,
  SUCCESS_SIGN_OUT_MESSAGE,
} from '@jdw/angular-shared-util';
import { BehaviorSubject, catchError, EMPTY, Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ENVIRONMENT, Environment } from '@jdw/angular-shared-util';
import { SnackbarService } from '../snackbar/snackbar.service';
import { DecodedToken } from '@jdw/angular-shared-util';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  private snackbarService = inject(SnackbarService);
  private cookieService = inject(CookieService);
  private environment: Environment = inject(ENVIRONMENT);
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  token$ = this.tokenSubject.asObservable();

  getToken() {
    return this.cookieService.get('jwtToken');
  }

  signIn(user: LoginUserRequest) {
    return this.http
      .post<{
        jwtToken: string;
      }>(`${this.environment.AUTH_BASE_URL}/auth/authenticate`, user)
      .pipe(
        tap((response) => {
          this.setToken(response.jwtToken);
          this.snackbarService.success(
            SUCCESS_SIGN_IN_MESSAGE,
            {
              variant: 'filled',
              autoClose: true,
            },
            true,
          );
        }),
        catchError((error) => this.handleSignInError(error)),
      );
  }

  signUp(user: CreateUserRequest) {
    return this.http
      .post(`${this.environment.AUTH_BASE_URL}/auth/user`, user)
      .pipe(
        tap(() => {
          this.snackbarService.success(
            SUCCESS_SIGN_UP_MESSAGE,
            {
              variant: 'filled',
              autoClose: true,
            },
            true,
          );
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  signOut(showSnackbar = true): void {
    this.clearToken();

    if (showSnackbar) {
      this.snackbarService.success(
        SUCCESS_SIGN_OUT_MESSAGE,
        {
          variant: 'filled',
          autoClose: true,
        },
        true,
      );
    }
  }

  handleSignInError(error: HttpErrorResponse) {
    let errorMessage = getErrorMessage(error);
    if (error.status === 400 || error.status === 401) {
      errorMessage = INVALID_SIGN_IN_MESSAGE;
    }
    this.snackbarService.error(
      errorMessage,
      {
        variant: 'filled',
        autoClose: false,
      },
      true,
    );
    return EMPTY;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = getErrorMessage(error);
    this.snackbarService.error(
      errorMessage,
      {
        variant: 'filled',
        autoClose: false,
      },
      true,
    );
    return EMPTY;
  }

  getDecodedToken(token?: string): DecodedToken {
    const jwt = token ?? this.getToken();
    return jwtDecode<DecodedToken>(jwt);
  }

  isTokenExpired(token?: string): boolean {
    const decoded = this.getDecodedToken(token);
    if (!decoded.exp) return true;
    return decoded.exp < Math.floor(Date.now() / 1000);
  }

  getUserIdFromToken(token?: string): string | number {
    const decoded = this.getDecodedToken(token);
    return decoded?.user_id ?? '';
  }

  private setToken(token: string): void {
    this.cookieService.set('jwtToken', token, {
      secure: true,
      path: '/',
    });
    this.tokenSubject.next(token);
  }

  private clearToken(): void {
    this.cookieService.delete('jwtToken');
    this.cookieService.delete('jwtToken', '/');
    this.tokenSubject.next(null);
  }
}
