import { $, $$, expect, browser } from '@wdio/globals'
import Page from './page.js';
import { MuscleGroupId } from '../utils/muscle-group-id.enum.js';

/**
 * Page object for the "Routine Detail" screen
 */
class RoutineDetailPage extends Page {
    /**
     * Define selectors using accessibility identifiers
     */
    public get screenTitle() {
        return $('~Routine Details');
    }

    public get routineDetailScreen() {
        return $('~routine-detail-screen');
    }

    public get addWorkoutDayButton() {
        return $('~add-workout-day-button');
    }

    public get addFirstDayButton() {
        return $('~add-first-day-button');
    }

    public get backButton() {
        return $('//XCUIElementTypeButton[@name="My Routines, back"]');
    }

    /**
      * Get the edit button for a specific workout day by day name
      * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
    */
    public getEditButtonForDay(dayName: string) {
        // Find the workout day container by its label containing the day name, then find edit button
        // Fixed: Use starts-with(@name, ...) instead of @name[starts-with(., ...)] - XPath 1.0 syntax
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//XCUIElementTypeOther[starts-with(@name, "edit-day-")]`);
    }

    /**
     * Get the delete button for a specific workout day by day name
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     */
    public getDeleteButtonForDay(dayName: string) {
        // Find the workout day container by its label containing the day name, then find delete button
        // Fixed: Use starts-with(@name, ...) instead of @name[starts-with(., ...)] - XPath 1.0 syntax
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//XCUIElementTypeOther[starts-with(@name, "delete-day-")]`);
    }

    /**
     * Get the muscle group container element for a specific muscle group and day
     * Finds the workout day container by day name, then locates the muscle group container within it
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     * @param muscleGroupName The muscle group name (e.g., "Chest")
     * @param numberOfSets The number of sets (e.g., 6)
     * @returns The muscle group container element (e.g., "Chest 6 sets")
     */
    public getMuscleGroupContainerForDay(dayName: string, muscleGroupName: string, numberOfSets: number) {
        // Find workout day container by day name, then find muscle group container that contains both muscle name and sets
        // Fixed: Use starts-with(@name, ...) instead of @name[starts-with(., ...)] - XPath 1.0 syntax requires starts-with() to be called on the attribute directly
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//XCUIElementTypeOther[@name="${muscleGroupName} ${numberOfSets} sets"]`);
    }

    /**
     * Get the sets input for a specific muscle group (for editing)
     * This is used in the edit form, not the display view
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     * @param muscleGroupId The muscle group ID (1-12)
     */
    public getSetsInputForMuscleGroupOfDay(muscleGroupId: MuscleGroupId) {
        // This method is for finding the input field in the edit form
        // The input field uses accessibility identifier: sets-input-{muscleGroupId}
        return $(`~sets-input-${muscleGroupId}`);
    }

    /**
     * Wait for the Routine Detail screen to be displayed
     */
    public async waitForScreen() {
        // Try multiple strategies to find the screen
        try {
            await expect(this.routineDetailScreen).toBeDisplayed({ wait: 5000 });
        } catch (error) {
            // Fallback to screen title
            await expect(this.screenTitle).toBeDisplayed({ wait: 5000 });
        }
    }

    /**
     * Add a workout day with multiple sets
     * @param dayName The name of the workout day (e.g., "Monday lower body")
     * @param sets Array of set strings in format "X sets of muscleGroup" (e.g., "4 sets of chest")
     */
    public async addWorkoutDay(dayName: string, ...sets: string[]) {
        // Tap add workout day button - this will open a form/modal
        console.log('Tapping add workout day button...');
        await this.tapAddWorkoutDay();
        
        // Wait a moment for navigation
        await browser.pause(1000);
        
        // Wait for the form screen to appear
        console.log('Waiting for Manage Workout Day screen...');
        await this.waitForManageWorkoutDayScreen();
        console.log('Manage Workout Day screen detected');
        
        // Enter day number (default to 1, can be made configurable later)
        console.log('Entering day number...');
        await this.enterDayNumber(1);
        console.log('Day number entered');
        
        // Enter day name
        console.log('Entering day name...');
        await this.enterDayName(dayName);
        console.log('Day name entered');
        
        // Dismiss keyboard if it's open by tapping outside or using a label
        try {
            const notesLabel = $('~Notes');
            if (await notesLabel.isDisplayed()) {
                await notesLabel.click();
                await browser.pause(300);
            }
        } catch (e) {
            // Keyboard might not be open or label not found
        }
        
        // Scroll down to muscle groups section - find first muscle group container and scroll to it
        const firstMuscleGroupContainer = $('~muscle-group-1');
        try {
            await firstMuscleGroupContainer.scrollIntoView();
            await browser.pause(500);
        } catch (e) {
            // Try scrolling to the sets input directly
            const firstSetsInput = $('~sets-input-1');
            try {
                await firstSetsInput.scrollIntoView();
                await browser.pause(500);
            } catch (e2) {
                // Continue anyway - might already be visible
            }
        }
        
        // Add each set
        console.log(`Adding ${sets.length} sets...`);
        for (let i = 0; i < sets.length; i++) {
            console.log(`Adding set ${i + 1}/${sets.length}: ${sets[i]}`);
            await this.addSet(sets[i]);
            console.log(`Set ${i + 1} added`);
            
            // Dismiss keyboard after each set to avoid blocking the next input
            if (i < sets.length - 1) { // Don't dismiss after last set
                // Simple approach: tap on Notes label to dismiss keyboard
                try {
                    const notesLabel = $('~Notes');
                    await notesLabel.click();
                    await browser.pause(400);
                } catch (e) {
                    // If Notes label not found, just wait a bit
                    await browser.pause(400);
                }
            }
        }
        
        // Save the workout day
        console.log('Saving workout day...');
        await this.saveWorkoutDay();
        console.log('Workout day saved');
    }

    /**
     * Tap the add workout day button
     * Tries both "Add Day" button and "Add First Day" button
     */
    public async tapAddWorkoutDay() {
        // Try "Add First Day" button first (when no days exist)
        try {
            await expect(this.addFirstDayButton).toBeDisplayed({ wait: 2000 });
            await this.addFirstDayButton.click();
            console.log('Clicked "Add First Day" button');
            return;
        } catch (error) {
            // Fall back to regular "Add Day" button
            console.log('"Add First Day" button not found, trying "Add Day" button');
        }
        
        // Use regular "Add Day" button
        await expect(this.addWorkoutDayButton).toBeDisplayed({ wait: 5000 });
        await this.addWorkoutDayButton.click();
        console.log('Clicked "Add Day" button');
    }

    /**
     * Wait for the Manage Workout Day screen to be displayed
     */
    public async waitForManageWorkoutDayScreen() {
        // Wait for the day number input - most reliable indicator
        const dayNumberInput = $('~day-number-input');
        await expect(dayNumberInput).toBeDisplayed({ wait: 10000 });
        
        // Give it a moment to fully render
        await browser.pause(500);
    }

    /**
     * Enter the day number
     * @param dayNumber The day number (1, 2, 3, etc.)
     */
    public async enterDayNumber(dayNumber: number) {
        // Try accessibility identifier first
        let dayNumberInput = $('~day-number-input');
        
        try {
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        } catch (e) {
            // Fallback to XPath
            dayNumberInput = $('//XCUIElementTypeTextField[@name="day-number-input"]');
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        }
        
        await expect(dayNumberInput).toBeEnabled({ wait: 2000 });
        
        // Click to focus first and wait for keyboard
        await dayNumberInput.click();
        await browser.pause(600);
        
        // Set the value - on iOS this should work directly
        await dayNumberInput.setValue(dayNumber.toString());
        await browser.pause(300);
    }

    /**
     * Enter the workout day name
     * @param dayName The name of the workout day
     */
    public async enterDayName(dayName: string) {
        const dayNameInput = $('~day-name-input');
        await expect(dayNameInput).toBeDisplayed({ wait: 5000 });
        await expect(dayNameInput).toBeEnabled({ wait: 2000 });
        
        // Click to focus first
        await dayNameInput.click();
        await browser.pause(200);
        
        // Set the value
        await dayNameInput.setValue(dayName);
        await browser.pause(200);
    }

    /**
     * Map muscle group names to their IDs in the form
     * The form uses muscle-group-{id} containers with sets-input-{id} fields
     */
    private getMuscleGroupId(muscleGroupName: string): number {
        const muscleGroupMap: { [key: string]: number } = {
            'chest': 1,
            'back': 2,
            'shoulders': 3,
            'shoulder': 3,
            'biceps': 4,
            'bicep': 4,
            'triceps': 5,
            'tricep': 5,
            'forearms': 6,
            'forearm': 6,
            'quadriceps': 7,
            'quad': 7,
            'hamstrings': 8,
            'hamstring': 8,
            'glutes': 9,
            'glute': 9,
            'calves': 10,
            'calf': 10,
            'abs': 11,
            'ab': 11,
            'lower back': 12,
            'lowerback': 12,
            'arm': 4, // Maps to biceps (can be adjusted if needed)
            'arms': 4
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
     * @param setString String in format "X sets of muscleGroup" (e.g., "4 sets of chest")
     */
    public async addSet(setString: string) {
        // Parse the set string: "4 sets of chest" -> numberOfSets: 4, muscleGroup: "chest"
        const match = setString.match(/(\d+)\s+sets?\s+of\s+(.+)/i);
        if (!match) {
            throw new Error(`Invalid set format: "${setString}". Expected format: "X sets of muscleGroup"`);
        }
        
        const numberOfSets = parseInt(match[1], 10);
        const muscleGroupName = match[2].trim();
        
        // Get the muscle group ID
        const muscleGroupId = this.getMuscleGroupId(muscleGroupName);
        
        // Enter number of sets for this muscle group
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
    }

    /**
     * Enter the number of sets for a specific muscle group
     * @param muscleGroupId The muscle group ID (1-12)
     * @param numberOfSets The number of sets
     */
    public async enterSetsForMuscleGroup(muscleGroupId: number, numberOfSets: number) {
        console.log(`Entering ${numberOfSets} sets for muscle group ${muscleGroupId}...`);
        const setsInput = $(`~sets-input-${muscleGroupId}`);
        
        // Wait for the element to exist in the DOM first
        await setsInput.waitForExist({ timeout: 5000 });
        console.log(`Element exists for muscle group ${muscleGroupId}`);
        
        // Try to scroll to the input - use simple scrollIntoView without options
        try {
            await setsInput.scrollIntoView();
            await browser.pause(500);
            console.log(`Scrolled to muscle group ${muscleGroupId}`);
        } catch (e) {
            console.log(`Scroll failed for muscle group ${muscleGroupId}, continuing...`);
        }
        
        // Wait for the input to be displayed and enabled
        await expect(setsInput).toBeDisplayed({ wait: 5000 });
        await expect(setsInput).toBeEnabled({ wait: 2000 });
        console.log(`Element is displayed and enabled for muscle group ${muscleGroupId}`);
        
        // Tap the input to focus it first (helps on iOS)
        await setsInput.click();
        await browser.pause(400);
        console.log(`Clicked input for muscle group ${muscleGroupId}`);
        
        // On iOS, we can directly set the value - it should replace existing
        await setsInput.setValue(numberOfSets.toString());
        console.log(`Set value ${numberOfSets} for muscle group ${muscleGroupId}`);
        
        // Wait a moment for the value to be set and UI to update
        await browser.pause(300);
    }

    /**
     * Save the workout day
     */
    public async saveWorkoutDay() {
        // Dismiss keyboard first if it's open
        try {
            const notesLabel = $('//XCUIElementTypeStaticText[@label="Notes"]');
            await notesLabel.doubleClick();
            await browser.pause(400);
        } catch (e) {
        }
        
        const saveButtonSelector = '//XCUIElementTypeOther[@label="Create Workout Day" or @label="Update Workout Day"]';
        let saveButton = $(saveButtonSelector);
        await saveButton.scrollIntoView();
        await browser.pause(1500);
        saveButton = $(saveButtonSelector);
        await saveButton.waitForExist({ timeout: 5000 });
        await expect(saveButton).toBeEnabled({ wait: 5000 });
        await saveButton.click();
        await browser.acceptAlert();
    }

    /**
     * Tap the back button to return to My Routines
     */
    public async tapBack() {
        await expect(this.backButton).toBeDisplayed();
        await this.backButton.click();
    }

    async editWorkoutDaySet(dayName: string, muscleGroupId: MuscleGroupId, numberOfSets: number) {
        await this.getEditButtonForDay(dayName).click();
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
        await this.saveWorkoutDay();
    }


    /**
     * Verify the displayed sets for a muscle group in a workout day
     * This checks the displayed text (not input field) in the routine detail view
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     * @param muscleGroupName The muscle group name (e.g., "Chest")
     * @param numberOfSets The expected number of sets
     */
    async verifyWorkoutDaySet(dayName: string, muscleGroupName: string, numberOfSets: number) {
        const muscleGroupContainer = this.getMuscleGroupContainerForDay(dayName, muscleGroupName, numberOfSets);
        await expect(muscleGroupContainer).toBeDisplayed({ wait: 5000 });
    }
}

export default new RoutineDetailPage();

