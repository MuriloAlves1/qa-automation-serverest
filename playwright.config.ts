import { defineConfig } from '@playwright/test';
import { env, isLocalApi } from './src/config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.API_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    // O projeto 'ui' entra na Fase 3
  ],

  // Sobe o ServeRest localmente: testes isolados, rápidos e sem depender do ambiente público
  webServer:
    isLocalApi && env.START_LOCAL_SERVER
      ? {
          command: 'npm run serverest',
          url: `${env.API_URL}/usuarios`,
          reuseExistingServer: !isCI,
          timeout: 60_000,
          stdout: 'ignore',
        }
      : undefined,
});
