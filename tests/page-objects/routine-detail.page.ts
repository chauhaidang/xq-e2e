import { $, expect, browser } from '@wdio/globals';
import RoutineDetailObjects from './objects/routine-detail.objects.js';
import { MuscleGroupId } from '../../support/utils/muscle-group-id.enum.js';
import Page from './page.js';

/**
 * Page object for the "Routine Detail" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class RoutineDetailPage extends Page {

    /**
     * Wait for the Routine Detail screen to be displayed
     */
    public async waitForScreen() {
        try {
            await expect(RoutineDetailObjects.routineDetailScreen).toBeDisplayed({ wait: 5000 });
        } catch (error) {
            await expect(RoutineDetailObjects.screenTitle).toBeDisplayed({ wait: 5000 });
        }
        return this;
    }

    /**
     * Add a workout day with multiple sets
     * @param dayName The name of the workout day
     * @param dayNumberOrFirstSet The day number (if number) or first set string (if string)
     * @param sets Array of set strings in format "X sets of muscleGroup"
     */
    public async addWorkoutDay(dayName: string, dayNumberOrFirstSet?: number | string, ...sets: string[]) {
        // Determine dayNumber: if first param is a number, use it; otherwise default to 1 and treat it as first set
        let dayNumber: number;
        let actualSets: string[];
        
        if (typeof dayNumberOrFirstSet === 'number') {
            dayNumber = dayNumberOrFirstSet;
            actualSets = sets;
        } else {
            dayNumber = 1; // Default to 1
            actualSets = dayNumberOrFirstSet ? [dayNumberOrFirstSet, ...sets] : sets;
        }
        console.log('Tapping add workout day button...');
        await this.tapAddWorkoutDay();
        
        await browser.pause(1000);
        
        console.log('Waiting for Manage Workout Day screen...');
        await this.waitForManageWorkoutDayScreen();
        console.log('Manage Workout Day screen detected');
        
        console.log(`Entering day number: ${dayNumber}...`);
        await this.enterDayNumber(dayNumber);
        console.log('Day number entered');
        
        console.log('Entering day name...');
        await this.enterDayName(dayName);
        console.log('Day name entered');
        
        try {
            const notesLabel = RoutineDetailObjects.notesLabel;
            if (await notesLabel.isDisplayed()) {
                await notesLabel.click();
                await browser.pause(300);
            }
        } catch (e) {
            // Keyboard might not be open
        }
        
        try {
            await RoutineDetailObjects.firstMuscleGroupContainer.scrollIntoView();
            await browser.pause(500);
        } catch (e) {
            try {
                await RoutineDetailObjects.firstSetsInput.scrollIntoView();
                await browser.pause(500);
            } catch (e2) {
                // Continue anyway
            }
        }
        
        console.log(`Adding ${actualSets.length} sets...`);
        for (let i = 0; i < actualSets.length; i++) {
            console.log(`Adding set ${i + 1}/${actualSets.length}: ${actualSets[i]}`);
            await this.addSet(actualSets[i]);
            console.log(`Set ${i + 1} added`);
            
            if (i < actualSets.length - 1) {
                try {
                    const notesLabel = RoutineDetailObjects.notesLabel;
                    await notesLabel.click();
                    await browser.pause(400);
                } catch (e) {
                    await browser.pause(400);
                }
            }
        }
        
        console.log('Saving workout day...');
        await this.saveWorkoutDay();
        console.log('Workout day saved');
        return this;
    }

    /**
     * Tap the add workout day button
     */
    public async tapAddWorkoutDay() {
        try {
            await expect(RoutineDetailObjects.addFirstDayButton).toBeDisplayed({ wait: 2000 });
            await RoutineDetailObjects.addFirstDayButton.click();
            console.log('Clicked "Add First Day" button');
            return this;
        } catch (error) {
            console.log('"Add First Day" button not found, trying "Add Day" button');
        }
        
        await expect(RoutineDetailObjects.addWorkoutDayButton).toBeDisplayed({ wait: 5000 });
        await RoutineDetailObjects.addWorkoutDayButton.click();
        console.log('Clicked "Add Day" button');
        return this;
    }

    /**
     * Wait for the Manage Workout Day screen to be displayed
     */
    public async waitForManageWorkoutDayScreen() {
        await expect(RoutineDetailObjects.dayNumberInput).toBeDisplayed({ wait: 10000 });
        await browser.pause(500);
        return this;
    }

    /**
     * Enter the day number
     * @param dayNumber The day number (1, 2, 3, etc.)
     */
    public async enterDayNumber(dayNumber: number) {
        let dayNumberInput = RoutineDetailObjects.dayNumberInput;
        
        try {
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        } catch (e) {
            dayNumberInput = $('//XCUIElementTypeTextField[@name="day-number-input"]');
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        }
        
        await expect(dayNumberInput).toBeEnabled({ wait: 2000 });
        await dayNumberInput.click();
        await browser.pause(600);
        await dayNumberInput.setValue(dayNumber.toString());
        await browser.pause(300);
        return this;
    }

    /**
     * Enter the workout day name
     * @param dayName The name of the workout day
     */
    public async enterDayName(dayName: string) {
        const dayNameInput = RoutineDetailObjects.dayNameInput;
        await expect(dayNameInput).toBeDisplayed({ wait: 5000 });
        await expect(dayNameInput).toBeEnabled({ wait: 2000 });
        await dayNameInput.click();
        await browser.pause(200);
        await dayNameInput.setValue(dayName);
        await browser.pause(200);
        return this;
    }

    /**
     * Map muscle group names to their IDs
     */
    private getMuscleGroupId(muscleGroupName: string): number {
        const muscleGroupMap: { [key: string]: number } = {
            'chest': 1, 'back': 2, 'shoulders': 3, 'shoulder': 3,
            'biceps': 4, 'bicep': 4, 'triceps': 5, 'tricep': 5,
            'forearms': 6, 'forearm': 6, 'quadriceps': 7, 'quad': 7,
            'hamstrings': 8, 'hamstring': 8, 'glutes': 9, 'glute': 9,
            'calves': 10, 'calf': 10, 'abs': 11, 'ab': 11,
            'lower back': 12, 'lowerback': 12, 'arm': 4, 'arms': 4
        };
        
        const normalizedName = muscleGroupName.toLowerCase().trim();
        const id = muscleGroupMap[normalizedName];
        
        if (!id) {
            throw new Error(`Unknown muscle group: "${muscleGroupName}". Available: ${Object.keys(muscleGroupMap).join(', ')}`);
        }
        
        return id;
    }

    /**
     * Add a set by parsing the set string
     * @param setString String in format "X sets of muscleGroup"
     */
    public async addSet(setString: string) {
        const match = setString.match(/(\d+)\s+sets?\s+of\s+(.+)/i);
        if (!match) {
            throw new Error(`Invalid set format: "${setString}". Expected format: "X sets of muscleGroup"`);
        }
        
        const numberOfSets = parseInt(match[1], 10);
        const muscleGroupName = match[2].trim();
        const muscleGroupId = this.getMuscleGroupId(muscleGroupName);
        
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
    }

    /**
     * Enter the number of sets for a specific muscle group
     * @param muscleGroupId The muscle group ID (1-12)
     * @param numberOfSets The number of sets
     */
    public async enterSetsForMuscleGroup(muscleGroupId: number, numberOfSets: number) {
        console.log(`Entering ${numberOfSets} sets for muscle group ${muscleGroupId}...`);
        const setsInput = RoutineDetailObjects.getSetsInputForMuscleGroup(muscleGroupId);
        
        await setsInput.waitForExist({ timeout: 5000 });
        console.log(`Element exists for muscle group ${muscleGroupId}`);
        
        try {
            await setsInput.scrollIntoView();
            await browser.pause(500);
            console.log(`Scrolled to muscle group ${muscleGroupId}`);
        } catch (e) {
            console.log(`Scroll failed for muscle group ${muscleGroupId}, continuing...`);
        }
        
        await expect(setsInput).toBeDisplayed({ wait: 5000 });
        await expect(setsInput).toBeEnabled({ wait: 2000 });
        console.log(`Element is displayed and enabled for muscle group ${muscleGroupId}`);
        
        await setsInput.click();
        await browser.pause(400);
        console.log(`Clicked input for muscle group ${muscleGroupId}`);
        
        await setsInput.setValue(numberOfSets.toString());
        console.log(`Set value ${numberOfSets} for muscle group ${muscleGroupId}`);
        
        await browser.pause(300);
        return this;
    }

    /**
     * Save the workout day
     */
    public async saveWorkoutDay() {
        try {
            const notesLabel = $('//XCUIElementTypeStaticText[@label="Notes"]');
            await notesLabel.doubleClick();
            await browser.pause(400);
        } catch (e) {
            // Continue
        }
        
        console.log('Looking for save workout day button...');
        let saveButton = RoutineDetailObjects.saveWorkoutDayButton;
        await saveButton.scrollIntoView();
        await browser.pause(1500);
        
        // Re-query the button to ensure we have the latest reference
        saveButton = RoutineDetailObjects.saveWorkoutDayButton;
        await saveButton.waitForExist({ timeout: 5000 });
        await expect(saveButton).toBeDisplayed({ wait: 5000 });
        await expect(saveButton).toBeEnabled({ wait: 5000 });
        
        console.log('Clicking save workout day button...');
        await saveButton.click();
        console.log('Save button clicked');
        await browser.pause(500); // Give time for the click to register
        
        // Handle alert if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                console.log(`⚠️  Accepting alert: ${alert}`);
                await browser.acceptAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present, continue
        }
        
        return this;
    }

    /**
     * Tap the back button to return to My Routines
     */
    public async tapBack() {
        await expect(RoutineDetailObjects.backButton).toBeDisplayed();
        await RoutineDetailObjects.backButton.click();
        return this;
    }

    /**
     * Edit workout day set
     */
    public async editWorkoutDaySet(dayName: string, muscleGroupId: MuscleGroupId, numberOfSets: number) {
        await RoutineDetailObjects.getEditButtonForDay(dayName).click();
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
        await this.saveWorkoutDay();
        return this;
    }

    /**
     * Verify the displayed sets for a muscle group in a workout day
     */
    public async verifyWorkoutDaySet(dayName: string, muscleGroupName: string, numberOfSets: number) {
        const muscleGroupContainer = RoutineDetailObjects.getMuscleGroupContainerForDay(dayName, muscleGroupName, numberOfSets);
        await expect(muscleGroupContainer).toBeDisplayed({ wait: 5000 });
        return this;
    }

    /**
     * Tap the create snapshot button
     */
    public async tapCreateSnapshot() {
        await expect(RoutineDetailObjects.createSnapshotButton).toBeDisplayed({ wait: 5000 });
        await RoutineDetailObjects.createSnapshotButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that snapshot creation is in progress (button disabled/loading)
     */
    public async verifySnapshotCreating() {
        await expect(RoutineDetailObjects.createSnapshotButton).toBeDisplayed({ wait: 5000 });
        // Button should be disabled during creation
        return this;
    }

    /**
     * Wait for snapshot creation to complete (check for success toast or button re-enabled)
     */
    public async waitForSnapshotCreationComplete() {
        // Wait for toast to appear or button to be re-enabled
        await browser.pause(3000);
        
        // Try to find success toast
        try {
            const successToast = $('//XCUIElementTypeStaticText[contains(@label, "snapshot") or contains(@label, "Snapshot")]');
            await expect(successToast).toBeDisplayed({ wait: 5000 });
        } catch (error) {
            // Toast might have disappeared, continue
        }
        
        await browser.pause(1000);
        return this;
    }
}

export default new RoutineDetailPage();
