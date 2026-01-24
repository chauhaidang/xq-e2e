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
     * Get sets text element by expected sets count within a specific muscle group
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     * @param expectedSets The expected number of sets
     */
    public getSetsTextForMuscleGroup(muscleGroupName: string, expectedSets: number) {
        return $(`//XCUIElementTypeOther[contains(@name, "muscle-group-") and contains(@label, "${muscleGroupName}")]//XCUIElementTypeStaticText[@label="${expectedSets}"]`);
    }

    /**
     * Get sets text element by expected sets count (legacy method for backward compatibility)
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

    /**
     * Get exercise totals section container
     */
    public get exerciseTotalsSection() {
        return $('~exercise-totals-section');
    }

    /**
     * Get exercise total item by exercise name
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getExerciseTotalByName(exerciseName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]`);
    }

    /**
     * Get exercise total item by index
     * @param index The index of the exercise total in the list (0-based)
     */
    public getExerciseTotalByIndex(index: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-")][${index + 1}]`);
    }

    /**
     * Get exercise name text within an exercise total item
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getExerciseNameText(exerciseName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${exerciseName}")]`);
    }

    /**
     * Get total reps text for an exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param totalReps The expected total reps value
     */
    public getTotalRepsText(exerciseName: string, totalReps: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${totalReps}")]`);
    }

    /**
     * Get total weight text for an exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param totalWeight The expected total weight value
     */
    public getTotalWeightText(exerciseName: string, totalWeight: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${totalWeight}")]`);
    }
}

export default new WeeklyReportObjects();

