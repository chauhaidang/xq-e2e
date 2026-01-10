import { apiHooks } from '../support/hooks/api-hooks.js';

/**
 * WebdriverIO configuration for API-only tests (headless mode)
 * This configuration runs tests without browser/app sessions
 */
export const config: WebdriverIO.Config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    tsConfigPath: '../tsconfig.json',
    
    //
    // ====================
    // Automation Protocol
    // ====================
    // Use Chrome DevTools Protocol (CDP) instead of WebDriver for lighter weight API tests
    automationProtocol: 'devtools',
    
    //
    // ==================
    // Specify Test Files
    // ==================
    // API-only tests located in tests/api/ directory
    specs: [
       '../tests/api/*.spec.ts'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Minimal capability using Chrome DevTools Protocol (CDP) with Chromium
    // Not actually used for API tests, but required by WebdriverIO
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome', // WebdriverIO uses 'chrome' as browserName even for Chromium
        'goog:chromeOptions': {
            // Use Chromium binary - can be overridden via CHROMIUM_PATH environment variable
            // If not set, WebdriverIO will try to find Chromium automatically
            ...(process.env.CHROMIUM_PATH && { binary: process.env.CHROMIUM_PATH }),
            args: [
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-software-rasterizer',
                '--disable-extensions'
            ]
        }
    }],

    //
    // ===================
    // Test Configurations
    // ===================
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'info',
    //
    // Set specific log levels per logger
    logLevels: {
        webdriver: 'warn', // Suppress webdriver logs for API tests
        'webdriverio': 'info',
        devtools: 'warn', // Suppress devtools logs for API tests
    },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Default timeout for all waitFor* commands (not used in API tests but required by config)
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 120000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // No services needed for API tests (no Appium, no browser)
    services: [],
    // Framework you want to run your specs with.
    framework: 'mocha',
    
    //
    // Test reporter for stdout.
    reporters: ['spec'],

    // Options to be passed to Mocha.
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000 // 60 seconds timeout for API tests (shorter than UI tests)
    },

    //
    // =====
    // Hooks
    // =====
    // Use API-specific hooks that don't require browser/app access
    
    /**
     * Skip browser session initialization for API tests
     * This prevents WebdriverIO from actually starting a browser
     */
    beforeSession: function (_config, _capabilities, _specs, _cid) {
        // For API tests, we don't need a browser session
        // The capability is only provided to satisfy WebdriverIO's requirement
        console.log('Running API tests - browser session will not be initialized');
    },
    
    afterTest: apiHooks.afterTest,
}

