import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'authui',
  exposes: {
    './Routes':
      'apps/angular/authui/authui/src/app/remote-entry/entry.routes.ts',
    './AuthWidget':
      'libs/angular/authui/feature/core/src/lib/auth-widget/auth-widget.component.ts',
  },
};

export default config;
