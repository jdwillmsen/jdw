import fallbackDefinitions from './module-federation.manifest.json';
import config from './config.json';
import { init } from '@module-federation/enhanced/runtime';

fetch(`${config.SERVICE_DISCOVERY_BASE_URL}/api/route-remotes`)
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching config: ${res.statusText}`);
    }
    return res.json();
  })
  .then((remotes) =>
    init({
      name: 'container',
      remotes: remotes,
    }),
  )
  .catch((err) => {
    console.error('Fetch failed, applying fallback config:', err);
    init({
      name: 'container',
      remotes: fallbackDefinitions,
    });
  })
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
