// Ref: https://github.com/Comfy-Org/ComfyUI_frontend/blob/57701f6145f622bf17237410c165966fb4aecc75/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },
  /* Path to global setup file. Exported function runs once before all the tests */
  globalSetup: './globalSetup.ts',
  /* Path to global teardown file. Exported function runs once after all the tests */
  globalTeardown: './globalTeardown.ts',
  
  timeout: 10000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'floating-button-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'floating_button.spec.ts'
    },
    {
      name: 'floating-button-chromium-2x',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 2 },
      testMatch: 'floating_button.spec.ts'
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grepInvert: /@mobile/, // Run all tests except those tagged with @mobile
      dependencies: ['floating-button-chromium']
    },

    {
      name: 'chromium-2x',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 2 },
      grepInvert: /@mobile/, // Run all tests except those tagged with @mobile
      dependencies: ['floating-button-chromium-2x']
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], hasTouch: true },
      grep: /@mobile/ // Run only tests tagged with @mobile
    }
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ]
})
