import { browser } from '@wdio/globals';
import MyRoutinesPage from '../page-objects/my-routines.page.js';
import CreateRoutinePage from '../page-objects/create-routine.page.js';

/**
 * Business tasks for routine management operations
 * Provides stable business operations that compose page object actions
 * Handles UI variations internally (popups, navigation, retries)
 */
class RoutineTasks {
    /**
     * Create a new routine with the given name and description
     * Handles UI variations: popups, navigation, keyboard dismissal
     * @param name The routine name
     * @param description The routine description
     * @param isActive Whether the routine should be active (default: true)
     */
    async createRoutine(name: string, description: string, isActive = true) {
        // Wait for screen and navigate to create routine
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapCreateRoutine();
        
        // Fill in routine details
        await CreateRoutinePage.enterRoutineName(name);
        await CreateRoutinePage.enterRoutineDescription(description);
        
        // Verify toggle state if needed
        if (isActive) {
            await CreateRoutinePage.verifyToggleIsActive();
        }
        
        // Create routine and handle popup (if any)
        await CreateRoutinePage.tapCreate();
        await CreateRoutinePage.closePopup();
        
        // Wait for navigation back to routines list
        await MyRoutinesPage.waitForScreen();
    }

    /**
     * Delete a routine by its name
     * Handles UI variations: confirmation dialogs, alerts
     * @param routineName The name of the routine to delete
     */
    async deleteRoutine(routineName: string) {
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapDeleteRoutine(routineName);
        
        // Wait for deletion to complete
        await browser.pause(500);
    }

    /**
     * Navigate to a routine by its name
     * Handles UI variations: screen loading, element visibility
     * @param routineName The name of the routine to navigate to
     */
    async navigateToRoutine(routineName: string) {
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapRoutineItem(routineName);
        
        // Wait for navigation to complete
        await browser.pause(1000);
    }

    /**
     * Verify that a routine exists in the list
     * @param routineName The name of the routine to verify
     */
    async verifyRoutineExists(routineName: string) {
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.verifyRoutineExists(routineName);
    }
}

export default new RoutineTasks();
