import { $ } from '@wdio/globals';

/**
 * Object definitions for the "Weekly Report" screen
 * Contains only selectors/objects - no actions
 */
class WeeklyReportObjects {
    public get screenTitle() {
        return $('~Weekly Report');
    }

    public get weeklyReportScreen() {
        return $('~weekly-report-screen');
    }

    public get loadingContainer() {
        return $('~loading-container');
    }

    public get loadingIndicator() {
        return $('~loading-indicator');
    }

    public get errorContainer() {
        return $('~error-container');
    }

    public get reloadButton() {
        return $('~reload-button');
    }

    public get emptyState() {
        return $('~empty-state');
    }

    /**
     * Get muscle group card by muscle group ID
     * @param muscleGroupId The muscle group ID (1-12)
     */
    public getMuscleGroupCard(muscleGroupId: number) {
        return $(`~muscle-group-${muscleGroupId}`);
    }

    /**
     * Get muscle group card by index
     * @param index The index of the muscle group in the list (0-based)
     */
    public getMuscleGroupCardByIndex(index: number) {
        return $(`//XCUIElementTypeOther[@name="muscle-group-"][${index + 1}]`);
    }

    /**
     * Get muscle group element by muscle group name
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     */
    public getMuscleGroupByName(muscleGroupName: string) {
        return $(`//XCUIElementTypeOther[contains(@name, "muscle-group-") and contains(@label, "${muscleGroupName}")]`);
    }

    /**
     * Get sets text element by expected sets count
     * @param expectedSets The expected number of sets
     */
    public getSetsText(expectedSets: number) {
        return $(`//XCUIElementTypeStaticText[contains(@label, "${expectedSets}")]`);
    }

    /**
     * Get back button
     */
    public get backButton() {
        return $('//XCUIElementTypeButton[contains(@name, "back")]');
    }
}

export default new WeeklyReportObjects();

