import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Test lifecycle hooks for WebdriverIO
 */
export const testHooks = {
    /**
     * Gets executed after a test (in Mocha/Jasmine only)
     * @param {object}  test             test object
     * @param {object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {*}       result.result    return object of test function
     * @param {number}  result.duration  duration of test
     * @param {boolean} result.passed    true if test has passed, otherwise false
     * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
     */
    afterTest: async function(test: any, context: any, { error, result, duration, passed, retries }: any) {
        // Healing mechanism: Print DOM tree when test fails to help identify correct locators
        if (!passed && error) {
            const { browser } = await import('@wdio/globals');
            try {
                const pageSource = await browser.getPageSource();
                console.log('\n========== HEALING MECHANISM: PAGE SOURCE (DOM TREE) ==========');
                console.log('Test failed. Below is the current page source to help identify correct locators:');
                console.log('================================================================');
                
                // Ensure artifacts directory exists
                const artifactsDir = path.join(process.cwd(), 'artifacts');
                const domCapturesDir = path.join(artifactsDir, 'dom-captures');
                const screenshotsDir = path.join(artifactsDir, 'screenshots');
                const logsDir = path.join(artifactsDir, 'logs');
                
                if (!fs.existsSync(domCapturesDir)) {
                    fs.mkdirSync(domCapturesDir, { recursive: true });
                }
                if (!fs.existsSync(screenshotsDir)) {
                    fs.mkdirSync(screenshotsDir, { recursive: true });
                }
                if (!fs.existsSync(logsDir)) {
                    fs.mkdirSync(logsDir, { recursive: true });
                }
                
                // Save page source
                const pageSourcePath = path.join(domCapturesDir, 'page-source.xml');
                fs.writeFileSync(pageSourcePath, pageSource);
                
                // Save screenshot
                const image = await browser.takeScreenshot();
                const screenshotPath = path.join(screenshotsDir, 'screenshot.png');
                fs.writeFileSync(screenshotPath, Buffer.from(image, 'base64'));
                
                console.log(`Page source saved to: ${pageSourcePath}`);
                console.log(`Screenshot saved to: ${screenshotPath}`);
                console.log('================================================================\n');
            } catch (err) {
                console.log('Could not retrieve page source:', err);
            }
        }
    },
};
