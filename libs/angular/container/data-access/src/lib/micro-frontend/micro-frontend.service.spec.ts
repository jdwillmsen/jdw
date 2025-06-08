import { TestBed } from '@angular/core/testing';

import { MicroFrontendService } from './micro-frontend.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SnackbarService } from '@jdw/angular-shared-data-access';
import { ENVIRONMENT, getErrorMessage } from '@jdw/angular-shared-util';

const mockSnackbarService = {
  error: jest.fn(),
};

const mockEnvironment = {
  SERVICE_DISCOVERY_BASE_URL: 'http://localhost:9000',
};

jest.mock('@jdw/angular-shared-util', () => ({
  ...jest.requireActual('@jdw/angular-shared-util'),
  getErrorMessage: jest.fn(),
}));

describe('MicroFrontendService', () => {
  let service: MicroFrontendService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: ENVIRONMENT, useValue: mockEnvironment },
      ],
    });

    service = TestBed.inject(MicroFrontendService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRouteRemotes', () => {
    it('should return expected route remotes', (done) => {
      const mockData = [
        {
          path: 'users',
          name: 'usersui',
          id: 'usersui/Routes',
          entry: 'http://localhost:4202/mf-manifest.json',
        },
      ];

      service.getRouteRemotes().subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/route-remotes`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle error and return empty array', (done) => {
      (getErrorMessage as jest.Mock).mockReturnValue('Network error');

      service.getRouteRemotes().subscribe((data) => {
        expect(data).toEqual([]);
        expect(mockSnackbarService.error).toHaveBeenCalledWith(
          'Network error',
          { variant: 'filled', autoClose: false },
          true,
        );
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/route-remotes`,
      );
      req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getComponentRemotes', () => {
    it('should return expected component remotes', (done) => {
      const mockData = [
        {
          name: 'authui',
          id: 'authui/AuthWidget',
          entry: 'http://localhost:4201/mf-manifest.json',
        },
      ];

      service.getComponentRemotes().subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/component-remotes`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle error and return empty array', (done) => {
      (getErrorMessage as jest.Mock).mockReturnValue('Component fetch failed');

      service.getComponentRemotes().subscribe((data) => {
        expect(data).toEqual([]);
        expect(mockSnackbarService.error).toHaveBeenCalledWith(
          'Component fetch failed',
          { variant: 'filled', autoClose: false },
          true,
        );
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/component-remotes`,
      );
      req.flush('Failed', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getNavigationItems', () => {
    it('should return expected navigation items', (done) => {
      const mockData = [
        {
          path: 'roles',
          icon: 'lock',
          title: 'Roles',
          description: 'This contains viewing and managing roles functionality',
        },
      ];

      service.getNavigationItems().subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/navigation-items`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle error and return empty array', (done) => {
      (getErrorMessage as jest.Mock).mockReturnValue('Navigation error');

      service.getNavigationItems().subscribe((data) => {
        expect(data).toEqual([]);
        expect(mockSnackbarService.error).toHaveBeenCalledWith(
          'Navigation error',
          { variant: 'filled', autoClose: false },
          true,
        );
        done();
      });

      const req = httpTesting.expectOne(
        `${mockEnvironment.SERVICE_DISCOVERY_BASE_URL}/api/navigation-items`,
      );
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('handleError', () => {
    it('should call snackbarService.error with the correct arguments and return an empty array', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Error message',
        status: 500,
      });
      const mockErrorMessage = 'Mock error message';
      (getErrorMessage as jest.Mock).mockReturnValue(mockErrorMessage);

      const result = service.handleError(errorResponse);

      expect(getErrorMessage).toHaveBeenCalledWith(errorResponse);
      expect(mockSnackbarService.error).toHaveBeenCalledWith(
        mockErrorMessage,
        { variant: 'filled', autoClose: false },
        true,
      );

      result.subscribe((data) => {
        expect(data).toEqual([]);
        done();
      });
    });
  });
});
