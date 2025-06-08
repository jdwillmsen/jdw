import { TestBed } from '@angular/core/testing';
import { DynamicRouteLoaderService } from './dynamic-route-loader.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@jdw/angular-shared-util';
import { MicroFrontendService } from '../micro-frontend/micro-frontend.service';
import { Router, Route } from '@angular/router';
import { of } from 'rxjs';
import { init, loadRemote } from '@module-federation/enhanced/runtime';
/* eslint-disable @nx/enforce-module-boundaries */
import { FallbackComponent } from '@jdw/angular-shared-ui';
/* eslint-enable @nx/enforce-module-boundaries */

jest.mock('@module-federation/enhanced/runtime', () => ({
  loadRemote: jest.fn(),
  init: jest.fn(),
}));

const mockEnvironment = {
  SERVICE_DISCOVERY_BASE_URL: 'http://localhost:9000',
};

describe('DynamicRouteLoaderService', () => {
  let service: DynamicRouteLoaderService;
  let mockRouter: Router;
  let mockMfService: MicroFrontendService;

  beforeEach(() => {
    mockRouter = {
      resetConfig: jest.fn(),
      config: [],
    } as unknown as Router;

    mockMfService = {
      getRouteRemotes: jest.fn().mockReturnValue(of([])),
    } as unknown as MicroFrontendService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ENVIRONMENT, useValue: mockEnvironment },
        { provide: MicroFrontendService, useValue: mockMfService },
      ],
    });
    service = TestBed.inject(DynamicRouteLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve routes from MicroFrontendService', async () => {
    await service.loadRoutes();
    expect(mockMfService.getRouteRemotes).toHaveBeenCalled();
  });

  it('should call init with the correct remotes', async () => {
    const routes = [
      {
        path: 'auth',
        name: 'authui',
        id: 'authui/Routes',
        entry: 'http://localhost:4201/mf-manifest.json',
      },
    ];
    (mockMfService.getRouteRemotes as jest.Mock).mockReturnValue(of(routes));
    (loadRemote as jest.Mock).mockResolvedValue({ remoteRoutes: [] });

    await service.loadRoutes();

    expect(init).toHaveBeenCalledWith({
      name: 'container',
      remotes: routes,
    });
  });

  it('should call router.resetConfig with dynamic routes', async () => {
    const routes = [
      {
        path: 'auth',
        name: 'authui',
        id: 'authui/Routes',
        entry: 'http://localhost:4201/mf-manifest.json',
      },
    ];
    (mockMfService.getRouteRemotes as jest.Mock).mockReturnValue(of(routes));
    (loadRemote as jest.Mock).mockResolvedValue({ remoteRoutes: [] });

    await service.loadRoutes();

    const expectedRoutes: Route[] = [
      ...mockRouter.config,
      { path: 'auth', loadChildren: expect.any(Function) },
      { path: '**', redirectTo: '' },
    ];

    expect(mockRouter.resetConfig).toHaveBeenCalledWith(expectedRoutes);
  });

  it('should handle errors when loadRemote fails', async () => {
    const routes = [
      {
        path: 'auth',
        name: 'authui',
        id: 'authui/Routes',
        entry: 'http://localhost:4201/mf-manifest.json',
      },
    ];
    (mockMfService.getRouteRemotes as jest.Mock).mockReturnValue(of(routes));
    (loadRemote as jest.Mock).mockRejectedValue(
      new Error('Failed to load remote'),
    );

    await service.loadRoutes();

    const configCallArgs = (mockRouter.resetConfig as jest.Mock).mock
      .calls[0][0];
    const exampleRoute = configCallArgs.find(
      (route: any) => route.path === 'auth',
    );

    const fallbackRoutes = await exampleRoute.loadChildren();
    expect(fallbackRoutes).toEqual([
      { path: '**', component: FallbackComponent },
    ]);
  });
});
