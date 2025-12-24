import { browser } from '@wdio/globals';
import MyRoutinesPage from '../page-objects/my-routines.page.js';
import RoutineDetailPage from '../page-objects/routine-detail.page.js';
import WeeklyReportPage from '../page-objects/weekly-report.page.js';

/**
 * Business tasks for weekly report operations
 * Provides stable business operations that compose page object actions
 * Handles UI variations internally (popups, navigation, retries)
 */
class WeeklyReportTasks {
    /**
     * Navigate to weekly report for a routine from the routine list
     * @param routineId The routine ID
     */
    async navigateToReport(routineId: number) {
        await MyRoutinesPage.tapReportButton(routineId);
        await WeeklyReportPage.waitForScreen();
    }

    /**
     * Navigate to weekly report for a routine by routine name
     * @param routineName The name of the routine
     */
    async navigateToReportByName(routineName: string) {
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapReportButtonByName(routineName);
        await WeeklyReportPage.waitForScreen();
    }

    /**
     * View weekly report and verify it displays data
     * @param routineId The routine ID
     */
    async viewReport(routineId: number) {
        await this.navigateToReport(routineId);
        await WeeklyReportPage.waitForLoadingToComplete();
        await WeeklyReportPage.verifyReportDisplayed();
    }

    /**
     * View weekly report and verify empty state
     * @param routineId The routine ID
     */
    async viewReportEmptyState(routineId: number) {
        await this.navigateToReport(routineId);
        await WeeklyReportPage.waitForLoadingToComplete();
        await WeeklyReportPage.verifyEmptyState();
    }

    /**
     * View weekly report and verify error state, then reload
     * @param routineId The routine ID
     */
    async viewReportWithError(routineId: number) {
        await this.navigateToReport(routineId);
        await WeeklyReportPage.waitForLoadingToComplete();
        await WeeklyReportPage.verifyErrorState();
        await WeeklyReportPage.tapReload();
        
        // Wait for reload to complete
        await browser.pause(2000);
    }

    /**
     * Create a weekly snapshot for a routine
     * @param routineName The name of the routine
     */
    async createSnapshot(routineName: string) {
        // Navigate to routine detail
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapRoutineItem(routineName);
        await RoutineDetailPage.waitForScreen();
        
        // Create snapshot
        await RoutineDetailPage.tapCreateSnapshot();
        await RoutineDetailPage.waitForSnapshotCreationComplete();
        
        // Wait for navigation back or screen update
        await browser.pause(1000);
    }

    /**
     * Create a weekly snapshot for a routine by routine ID
     * @param routineId The routine ID (unused, kept for API consistency)
     */
    async createSnapshotById(routineId: number) {
        // Navigate to routine detail (assuming we can navigate by ID)
        // This might need to be adjusted based on actual navigation flow
        await RoutineDetailPage.waitForScreen();
        
        // Create snapshot
        await RoutineDetailPage.tapCreateSnapshot();
        await RoutineDetailPage.waitForSnapshotCreationComplete();
        
        // Wait for navigation back or screen update
        await browser.pause(1000);
    }

    /**
     * Complete flow: Create snapshot then view report
     * @param routineName The name of the routine
     */
    async createSnapshotAndViewReport(routineName: string) {
        // Create snapshot
        await this.createSnapshot(routineName);
        
        // Navigate back to routines list
        await RoutineDetailPage.tapBack();
        await MyRoutinesPage.waitForScreen();
        
        // Navigate to report
        await this.navigateToReportByName(routineName);
    }

    /**
     * Verify muscle group total in report
     * @param routineId The routine ID
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     * @param expectedSets The expected number of sets
     */
    async verifyMuscleGroupTotal(muscleGroupName: string, expectedSets: number) {
        await WeeklyReportPage.verifyMuscleGroupTotal(muscleGroupName, expectedSets);
    }
}

export default new WeeklyReportTasks();

