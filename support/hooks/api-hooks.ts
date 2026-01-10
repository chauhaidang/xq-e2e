/**
 * API-specific test hooks for WebdriverIO
 * These hooks are designed for API-only tests that don't require browser/app sessions
 */
export const apiHooks = {
    /**
     * Gets executed after a test (in Mocha/Jasmine only)
     * Simplified version that doesn't access browser object
     * @param {object}  test             test object
     * @param {object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {*}       result.result    return object of test function
     * @param {number}  result.duration  duration of test
     * @param {boolean} result.passed    true if test has passed, otherwise false
     * @param {object}  result.retries   information about spec related retries, e.g. { attempts: 0, limit: 0 }
     */
    afterTest: async function(test: any, context: any, { error, result, duration, passed, retries }: any) {
        // Log test failure details for API tests
        if (!passed && error) {
            console.log('\n========== API TEST FAILURE ==========');
            console.log(`Test: ${test.title}`);
            console.log(`Error: ${error.message}`);
            if (error.stack) {
                console.log(`Stack trace:\n${error.stack}`);
            }
            console.log('=====================================\n');
        }
        
        // Optional: Log test duration for performance monitoring
        if (process.env.DEBUG === 'true') {
            console.log(`Test "${test.title}" completed in ${duration}ms`);
        }
    },
};

