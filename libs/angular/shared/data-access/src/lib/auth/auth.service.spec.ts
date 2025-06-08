import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  CreateUserRequest,
  ENVIRONMENT,
  LoginUserRequest,
} from '@jdw/angular-shared-util';
import { CookieService } from 'ngx-cookie-service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { first } from 'rxjs';

const mockSnackbarService = {
  success: jest.fn(),
  error: jest.fn(),
};

const mockCookieService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};
const environmentMock = {
  AUTH_BASE_URL: 'http://localhost:8080',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: environmentMock,
        },
        {
          provide: SnackbarService,
          useValue: mockSnackbarService,
        },
        {
          provide: CookieService,
          useValue: mockCookieService,
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('should retrieve the JWT token from cookies', () => {
      mockCookieService.get.mockReturnValue('mockJwtToken');
      const token = service.getToken();
      expect(token).toBe('mockJwtToken');
      expect(mockCookieService.get).toHaveBeenCalledWith('jwtToken');
    });
  });

  describe('signIn', () => {
    it('should send a POST request and store JWT token on success', () => {
      const mockUser: LoginUserRequest = {
        emailAddress: 'user@jdw.com',
        password: 'P@ssw0rd',
      };
      const mockResponse = { jwtToken: 'mockJwtToken' };

      service.signIn(mockUser).subscribe();

      const req = httpTesting.expectOne(
        `${environmentMock.AUTH_BASE_URL}/auth/authenticate`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(mockCookieService.set).toHaveBeenCalledWith(
        'jwtToken',
        'mockJwtToken',
        {
          secure: true,
          path: '/',
        },
      );
      expect(mockSnackbarService.success).toHaveBeenCalledWith(
        'Sign in successful',
        { variant: 'filled', autoClose: true },
        true,
      );
    });

    it('should handle sign-in error and show the correct error message', () => {
      const mockUser: LoginUserRequest = {
        emailAddress: 'user@jdw.com',
        password: 'P@ssw0rd',
      };

      service.signIn(mockUser).subscribe();

      const req = httpTesting.expectOne(
        `${environmentMock.AUTH_BASE_URL}/auth/authenticate`,
      );
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(mockSnackbarService.error).toHaveBeenCalledWith(
        'Invalid email or password',
        { variant: 'filled', autoClose: false },
        true,
      );
    });

    it('should emit new token on signIn', (done) => {
      const mockUser: LoginUserRequest = {
        emailAddress: 'user@jdw.com',
        password: 'P@ssw0rd',
      };
      const mockResponse = { jwtToken: 'mockJwtToken' };

      service.token$
        .pipe(first((token) => token === 'mockJwtToken'))
        .subscribe((token) => {
          expect(token).toBe('mockJwtToken');
          done();
        });

      service.signIn(mockUser).subscribe();
      const req = httpTesting.expectOne(
        `${environmentMock.AUTH_BASE_URL}/auth/authenticate`,
      );
      req.flush(mockResponse);
    });
  });

  describe('signUp', () => {
    it('should send a POST request and handle success', () => {
      const mockUser: CreateUserRequest = {
        emailAddress: 'user@jdw.com',
        password: 'P@ssw0rd',
      };

      service.signUp(mockUser).subscribe();

      const req = httpTesting.expectOne(
        `${environmentMock.AUTH_BASE_URL}/auth/user`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(mockSnackbarService.success).toHaveBeenCalledWith(
        'Sign up successful',
        { variant: 'filled', autoClose: true },
        true,
      );
    });

    it('should handle sign-up error and show the correct error message', () => {
      const mockUser: CreateUserRequest = {
        emailAddress: 'user@jdw.com',
        password: 'P@ssw0rd',
      };

      service.signUp(mockUser).subscribe();

      const req = httpTesting.expectOne(
        `${environmentMock.AUTH_BASE_URL}/auth/user`,
      );
      req.flush(
        { message: 'Bad Request' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(mockSnackbarService.error).toHaveBeenCalledWith(
        'There was an issue with your submission. Please check your input and try again.',
        { variant: 'filled', autoClose: false },
        true,
      );
    });
  });

  describe('signOut', () => {
    it('should delete the jwtToken cookie and show a success snackbar', () => {
      service.signOut();

      expect(mockCookieService.delete).toHaveBeenCalledWith('jwtToken');
      expect(mockSnackbarService.success).toHaveBeenCalledWith(
        'Sign out successful',
        { variant: 'filled', autoClose: true },
        true,
      );
    });

    it('should delete the jwtToken cookie and NOT show a snackbar if showSnackbar is false', () => {
      service.signOut(false);

      expect(mockCookieService.delete).toHaveBeenCalledWith('jwtToken');
      expect(mockSnackbarService.success).not.toHaveBeenCalled();
    });

    it('should emit null on signOut', (done) => {
      service.token$.subscribe((token) => {
        if (token === null) {
          expect(token).toBeNull();
          done();
        }
      });

      service.signOut();
    });
  });

  describe('handleSignInError', () => {
    it('should return a specific message for 401 status', () => {
      const mockError = new HttpErrorResponse({ status: 401 });

      service.handleSignInError(mockError);

      expect(mockSnackbarService.error).toHaveBeenCalledWith(
        'Invalid email or password',
        { variant: 'filled', autoClose: false },
        true,
      );
    });

    it('should return a generic error message for other statuses', () => {
      const mockError = new HttpErrorResponse({ status: 500 });

      service.handleSignInError(mockError);

      expect(mockSnackbarService.error).toHaveBeenCalledWith(
        'An unexpected error occurred on our server. Please try again later.',
        { variant: 'filled', autoClose: false },
        true,
      );
    });
  });

  describe('getDecodedToken', () => {
    it('should decode the given token', () => {
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJ1c2VyX2lkIjoiMTIzNDUiLCJleHAiOjQ3MjM2ODgwMDB9.' +
        'signature';

      const decoded = service.getDecodedToken(mockToken);
      expect(decoded.user_id).toBe('12345');
      expect(decoded.exp).toBe(4723688000);
    });

    it('should decode the token from cookie if none provided', () => {
      mockCookieService.get.mockReturnValue(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
          'eyJ1c2VyX2lkIjoiYWJjZCIsImV4cCI6MTk5OTk5OTk5OX0.' +
          'signature',
      );

      const decoded = service.getDecodedToken();
      expect(decoded.user_id).toBe('abcd');
      expect(decoded.exp).toBe(1999999999);
      expect(mockCookieService.get).toHaveBeenCalledWith('jwtToken');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for a valid, non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 1000;
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: futureExp }),
      )}.signature`;

      expect(service.isTokenExpired(token)).toBe(false);
    });

    it('should return true for an expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 1000;
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: pastExp }),
      )}.signature`;

      expect(service.isTokenExpired(token)).toBe(true);
    });

    it('should return true if token has no exp', () => {
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ user_id: 'abc' }),
      )}.signature`;

      expect(service.isTokenExpired(token)).toBe(true);
    });
  });

  describe('getUserIdFromToken', () => {
    it('should return user_id from token', () => {
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ user_id: 'abc123' }),
      )}.signature`;

      expect(service.getUserIdFromToken(token)).toBe('abc123');
    });

    it('should return empty string if user_id not in token', () => {
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ other: 'data' }),
      )}.signature`;

      expect(service.getUserIdFromToken(token)).toBe('');
    });
  });
});
