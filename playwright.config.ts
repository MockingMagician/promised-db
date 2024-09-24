import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    // Look for test files in the "tests" directory, relative to this configuration file.
    testDir: 'test/browser/test',

    // Run all tests in parallel.
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,

    // Retry on CI only.
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:3456',
        trace: 'on-first-retry',
    },

    // Run your local dev server before starting the tests.
    webServer: {
        command: 'npx http-server ./test/browser/serve -p 3456',
        url: 'http://localhost:3456',
        reuseExistingServer: !process.env.CI,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
        },
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
            },
        },
        {
            name: 'Google Chrome',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
            },
        },
        {
            name: 'Microsoft Edge',
            use: {
                ...devices['Desktop Edge'],
                channel: 'msedge',
            },
        },
    ],
})
