import { expect, browser } from '@wdio/globals';
import ManageExerciseObjects from './objects/manage-exercise.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';

/**
 * Page object for the "Manage Exercise" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class ManageExercisePage extends Page {
    /**
     * Wait for the Manage Exercise screen to be displayed
     */
    public async waitForScreen() {
        try {
            await expect(ManageExerciseObjects.manageExerciseScreen).toBeDisplayed({ wait: 10000 });
        } catch (error) {
            await expect(ManageExerciseObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        }
        await browser.pause(500);
        return this;
    }

    /**
     * Enter exercise name
     * @param exerciseName The name of the exercise
     */
    public async enterExerciseName(exerciseName: string) {
        const exerciseNameInput = ManageExerciseObjects.exerciseNameInput;
        await expect(exerciseNameInput).toBeDisplayed({ wait: 5000 });
        await expect(exerciseNameInput).toBeEnabled({ wait: 2000 });
        await exerciseNameInput.click();
        await browser.pause(200);
        await exerciseNameInput.setValue(exerciseName);
        await browser.pause(200);
        return this;
    }

    /**
     * Enter total reps
     * @param totalReps The total number of reps
     */
    public async enterTotalReps(totalReps: number) {
        const totalRepsInput = ManageExerciseObjects.totalRepsInput;
        await expect(totalRepsInput).toBeDisplayed({ wait: 5000 });
        await expect(totalRepsInput).toBeEnabled({ wait: 2000 });
        await totalRepsInput.click();
        await browser.pause(200);
        await totalRepsInput.setValue(totalReps.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter weight
     * @param weight The weight value
     */
    public async enterWeight(weight: number) {
        const weightInput = ManageExerciseObjects.weightInput;
        await expect(weightInput).toBeDisplayed({ wait: 5000 });
        await expect(weightInput).toBeEnabled({ wait: 2000 });
        await weightInput.click();
        await browser.pause(200);
        await weightInput.setValue(weight.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter total sets
     * @param totalSets The total number of sets
     */
    public async enterTotalSets(totalSets: number) {
        const totalSetsInput = ManageExerciseObjects.totalSetsInput;
        await expect(totalSetsInput).toBeDisplayed({ wait: 5000 });
        await expect(totalSetsInput).toBeEnabled({ wait: 2000 });
        await totalSetsInput.click();
        await browser.pause(200);
        await totalSetsInput.setValue(totalSets.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter notes
     * @param notes The notes text
     */
    public async enterNotes(notes: string) {
        const notesInput = ManageExerciseObjects.notesInput;
        await expect(notesInput).toBeDisplayed({ wait: 5000 });
        await expect(notesInput).toBeEnabled({ wait: 2000 });
        await notesInput.click();
        await browser.pause(200);
        await notesInput.setValue(notes);
        await browser.pause(200);
        return this;
    }

    /**
     * Tap the save button
     */
    public async tapSave() {
        // Dismiss keyboard if present
        try {
            const notesInput = ManageExerciseObjects.notesInput;
            if (await notesInput.isDisplayed()) {
                await notesInput.click();
                await browser.pause(200);
            }
        } catch (e) {
            // Keyboard might not be open
        }

        const saveButton = ManageExerciseObjects.saveButton;
        await saveButton.scrollIntoView();
        await browser.pause(500);
        await expect(saveButton).toBeDisplayed({ wait: 5000 });
        await saveButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Tap the cancel button
     */
    public async tapCancel() {
        const cancelButton = ManageExerciseObjects.cancelButton;
        await expect(cancelButton).toBeDisplayed({ wait: 5000 });
        await cancelButton.click();
        await browser.pause(500);
        return this;
    }

    /**
     * Tap the delete button
     */
    public async tapDelete() {
        const deleteButton = ManageExerciseObjects.deleteButton;
        await expect(deleteButton).toBeDisplayed({ wait: 5000 });
        await deleteButton.click();
        await browser.pause(500);
        
        // Handle confirmation alert if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                await browser.acceptAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present, continue
        }
        
        return this;
    }

    /**
     * Verify that an exercise is displayed with specific values
     * @param exerciseName The expected exercise name
     * @param totalReps The expected total reps
     * @param weight The expected weight
     * @param totalSets The expected total sets
     */
    public async verifyExerciseDisplayed(exerciseName: string, totalReps?: number, weight?: number, totalSets?: number) {
        // Verify exercise name is displayed
        const exerciseNameInput = ManageExerciseObjects.exerciseNameInput;
        await expect(exerciseNameInput).toBeDisplayed({ wait: 5000 });
        
        // If values are provided, verify they match
        if (totalReps !== undefined) {
            const totalRepsInput = ManageExerciseObjects.totalRepsInput;
            await expect(totalRepsInput).toBeDisplayed({ wait: 5000 });
        }
        
        if (weight !== undefined) {
            const weightInput = ManageExerciseObjects.weightInput;
            await expect(weightInput).toBeDisplayed({ wait: 5000 });
        }
        
        if (totalSets !== undefined) {
            const totalSetsInput = ManageExerciseObjects.totalSetsInput;
            await expect(totalSetsInput).toBeDisplayed({ wait: 5000 });
        }
        
        return this;
    }

    /**
     * Tap the back button
     */
    public async tapBack() {
        await expect(ManageExerciseObjects.backButton).toBeDisplayed({ wait: 5000 });
        await ManageExerciseObjects.backButton.click();
        await browser.pause(500);
        return this;
    }
}

export default new ManageExercisePage();

/**
 * Creates a fluent proxy instance of ManageExercisePage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentManageExercisePage();
 * await fluentPage
 *     .waitForScreen()
 *     .enterExerciseName('Bench Press')
 *     .enterTotalReps(30)
 *     .enterWeight(135)
 *     .enterTotalSets(3)
 *     .tapSave()
 *     .execute();
 * ```
 */
export const createFluentManageExercisePage = () => createFluentProxy(new ManageExercisePage());
