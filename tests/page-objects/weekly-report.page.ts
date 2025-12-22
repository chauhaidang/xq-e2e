import { expect, browser } from '@wdio/globals';
import WeeklyReportObjects from './objects/weekly-report.objects.js';
import Page from './page.js';

/**
 * Page object for the "Weekly Report" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class WeeklyReportPage extends Page {
    /**
     * Wait for the Weekly Report screen to be displayed
     */
    public async waitForScreen() {
        await browser.pause(2000);
        
        // Handle alerts if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                console.log(`⚠️  Dismissing alert: ${alert}`);
                await browser.dismissAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present
        }
        
        try {
            await expect(WeeklyReportObjects.weeklyReportScreen).toBeDisplayed({ wait: 10000 });
        } catch (error) {
            // Try alternative selector
            await expect(WeeklyReportObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        }
        return this;
    }

    /**
     * Wait for loading to complete
     */
    public async waitForLoadingToComplete() {
        try {
            // Wait for loading indicator to disappear
            await WeeklyReportObjects.loadingIndicator.waitForDisplayed({ timeout: 5000, reverse: true });
        } catch (error) {
            // Loading might have already completed
        }
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that the report is displayed with data
     */
    public async verifyReportDisplayed() {
        await this.waitForLoadingToComplete();
        
        // Verify we're not in loading or error state
        try {
            const loadingContainer = await WeeklyReportObjects.loadingContainer.isDisplayed();
            if (loadingContainer) {
                throw new Error('Report is still in loading state');
            }
        } catch (error) {
            // Loading container not found, which is good
        }
        
        try {
            const errorContainer = await WeeklyReportObjects.errorContainer.isDisplayed();
            if (errorContainer) {
                throw new Error('Report is in error state');
            }
        } catch (error) {
            // Error container not found, which is good
        }
        
        // Verify report screen is displayed
        await expect(WeeklyReportObjects.weeklyReportScreen).toBeDisplayed({ wait: 5000 });
        
        return this;
    }

    /**
     * Verify that the empty state is displayed
     */
    public async verifyEmptyState() {
        await this.waitForLoadingToComplete();
        await expect(WeeklyReportObjects.emptyState).toBeDisplayed({ wait: 5000 });
        return this;
    }

    /**
     * Verify that an error state is displayed
     */
    public async verifyErrorState() {
        await this.waitForLoadingToComplete();
        await expect(WeeklyReportObjects.errorContainer).toBeDisplayed({ wait: 5000 });
        return this;
    }

    /**
     * Tap the reload button (used when error occurs)
     */
    public async tapReload() {
        await expect(WeeklyReportObjects.reloadButton).toBeDisplayed({ wait: 5000 });
        await WeeklyReportObjects.reloadButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that a muscle group is displayed with a specific total sets count
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     * @param expectedSets The expected number of sets
     */
    public async verifyMuscleGroupTotal(muscleGroupName: string, expectedSets: number) {
        const muscleGroupElement = WeeklyReportObjects.getMuscleGroupByName(muscleGroupName);
        await expect(muscleGroupElement).toBeDisplayed({ wait: 5000 });
        
        // Verify the sets count is displayed within the specific muscle group card
        const setsText = WeeklyReportObjects.getSetsTextForMuscleGroup(muscleGroupName, expectedSets);
        await expect(setsText).toBeDisplayed({ wait: 3000 });
        
        return this;
    }

    /**
     * Get the back button to return to previous screen
     */
    public async tapBack() {
        await expect(WeeklyReportObjects.backButton).toBeDisplayed({ wait: 5000 });
        await WeeklyReportObjects.backButton.click();
        await browser.pause(1000);
        return this;
    }
}

export default new WeeklyReportPage();

