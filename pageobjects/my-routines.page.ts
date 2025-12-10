import { $, $$, expect } from '@wdio/globals'
import Page from './page.js';

/**
 * Page object for the "My Routines" screen
 */
class MyRoutinesPage extends Page {
    /**
     * Define selectors using accessibility identifiers
     */
    public get screenTitle() {
        return $('~My Routines');
    }

    public get createRoutineButton() {
        return $('~create-routine-button');
    }

    public get routineList() {
        return $$('~Routine Item');
    }

    public get routineListScreen() {
        return $('~routine-list-screen');
    }

    public get routineListContainer() {
        return $('~routine-list');
    }

    /**
     * Get routine item by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getRoutineItem(index: number) {
        return $(`~routine-item-${index}`);
    }

    /**
     * Get routine item touchable area by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getRoutineItemTouchable(index: number) {
        return $(`~routine-item-touchable-${index}`);
    }

    /**
     * Get edit button for routine by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getEditRoutineButton(index: number) {
        return $(`~edit-routine-${index}`);
    }

    /**
     * Get delete button for routine by name
     * @param routineName The name of the routine
     */
    public getDeleteRoutineButton(routineName: string) {
        return $(`//*[@label="Delete routine ${routineName}"]`);
    }

    /**
     * Wait for the My Routines screen to be displayed
     */
    public async waitForScreen() {
        // Wait a bit for the screen to fully render
        await browser.pause(2000);
        
        // Dismiss any error alerts that might be blocking the screen
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                console.log(`⚠️  Dismissing alert: ${alert}`);
                await browser.dismissAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present, continue
        }
        
        // Try multiple selectors as fallback
        try {
            await expect(this.screenTitle).toBeDisplayed({ timeout: 10000 });
        } catch (error) {
            // Fallback: try waiting for the routine list screen or container
            try {
                await expect(this.routineListScreen).toBeDisplayed({ timeout: 5000 });
            } catch {
                await expect(this.routineListContainer).toBeDisplayed({ timeout: 5000 });
            }
        }
    }

    /**
     * Tap on the Create Routine button
     */
    public async tapCreateRoutine() {
        await this.createRoutineButton.click();
    }

    /**
     * Get the list of routines
     * @returns Promise<WebdriverIO.ElementArray> Array of routine elements
     */
    public async getRoutineList() {
        return await this.routineList;
    }

    /**
     * Verify that a routine with the given name exists in the list
     * @param routineName The name of the routine to verify
     */
    public async verifyRoutineExists(routineName: string) {
        // The routine name appears in the label of routine-item elements
        // Try to find an element that contains the routine name in its label
        // This works because routine items have labels like "Morning Workout My daily morning routine ● Active..."
        
        // Strategy 1: Find routine-item-touchable element with label containing routine name
        let routineElement = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
        
        try {
            await routineElement.waitForDisplayed({ timeout: 5000 });
            return; // Found it!
        } catch (error) {
            // Try alternative strategies
        }
        
        // Strategy 2: Find any element with label starting with routine name
        routineElement = $(`//XCUIElementTypeOther[starts-with(@label, "${routineName}")]`);
        try {
            await routineElement.waitForDisplayed({ timeout: 3000 });
            return;
        } catch (error) {
            // Try next strategy
        }
        
        // Strategy 3: Find routine-item container
        routineElement = $(`//XCUIElementTypeOther[contains(@name, "routine-item") and contains(@label, "${routineName}")]`);
        try {
            await routineElement.waitForDisplayed({ timeout: 3000 });
            return;
        } catch (error) {
            // Last resort
        }
        
        // Strategy 4: Try StaticText (fallback)
        routineElement = $(`//XCUIElementTypeStaticText[@name="${routineName}"]`);
        await routineElement.waitForDisplayed({ timeout: 10000 });
    }

    /**
     * Tap on a routine item to view/edit it
     * @param indexOrName The index of the routine (1-based) or the routine name
     */
    public async tapRoutineItem(indexOrName: number | string) {
        if (typeof indexOrName === 'number') {
            // Use index-based approach
            const routineItem = await this.getRoutineItemTouchable(indexOrName);
            await expect(routineItem).toBeDisplayed();
            await routineItem.click();
        } else {
            // Find by name using XPath
            const routineItem = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${indexOrName}")]`);
            await expect(routineItem).toBeDisplayed();
            await routineItem.click();
        }
    }

    /**
     * Tap edit button for a routine
     * @param index The index of the routine (1-based)
     */
    public async tapEditRoutine(index: number) {
        const editButton = await this.getEditRoutineButton(index);
        await expect(editButton).toBeDisplayed();
        await editButton.click();
    }

    /**
     * Tap delete button for a routine
     * @param index The index of the routine (1-based)
     */
    public async tapDeleteRoutine(routineName: string) {
        const deleteButton = await this.getDeleteRoutineButton(routineName);
        await expect(deleteButton).toBeDisplayed();
        await deleteButton.click();
        await browser.acceptAlert()
    }

    /**
     * Delete a routine by its name
     * @param routineName The name of the routine to delete
     */
    public async deleteRoutineByName(routineName: string) {
        try {
            // Wait for screen to be ready with retries
            let screenReady = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await this.waitForScreen();
                    screenReady = true;
                    break;
                } catch (e) {
                    await browser.pause(1000);
                }
            }
            
            if (!screenReady) {
                // Try to find the routine anyway - might be on the screen even if waitForScreen failed
                console.log('Screen wait failed, attempting to find routine anyway...');
            }
            
            await browser.pause(500);
            
            // Get all routine items and find the one matching the name
            const routines = await this.getRoutineList();
            let routineIndex = -1;
            
            for (let i = 0; i < routines.length; i++) {
                try {
                    const routine = routines[i];
                    const label = await routine.getAttribute('label');
                    if (label && label.includes(routineName)) {
                        routineIndex = i + 1; // Convert to 1-based index
                        break;
                    }
                } catch (e) {
                    // Continue searching
                    continue;
                }
            }
            
            if (routineIndex === -1) {
                // Try alternative: find by XPath
                const routineItem = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
                try {
                    await expect(routineItem).toBeDisplayed({ timeout: 2000 });
                    // If found, try to get index from the name attribute
                    const nameAttr = await routineItem.getAttribute('name');
                    const match = nameAttr?.match(/routine-item-touchable-(\d+)/);
                    if (match) {
                        routineIndex = parseInt(match[1], 10);
                    }
                } catch (e) {
                    console.log(`Routine "${routineName}" not found - may already be deleted`);
                    return; // Routine doesn't exist, which is fine for cleanup
                }
            }
            
            if (routineIndex === -1) {
                console.log(`Could not determine index for routine "${routineName}"`);
                return;
            }
            
            // Use the existing delete method with the found index
            await this.tapDeleteRoutine(routineIndex);
            
            // Handle confirmation dialog if it appears
            await browser.pause(500);
            try {
                // Look for confirmation buttons (Delete, Confirm, OK, etc.)
                const confirmSelectors = [
                    $('~Delete'),
                    $('~Confirm'),
                    $('~OK'),
                    $('//XCUIElementTypeButton[@name="Delete"]'),
                    $('//XCUIElementTypeButton[@name="Confirm"]'),
                    $('//XCUIElementTypeButton[contains(@label, "Delete")]')
                ];
                
                for (const confirmButton of confirmSelectors) {
                    try {
                        if (await confirmButton.isDisplayed({ timeout: 1000 })) {
                            await confirmButton.click();
                            await browser.pause(500);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            } catch (e) {
                // No confirmation dialog, continue
            }
            
            // Wait a moment for deletion to complete
            await browser.pause(500);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`Error deleting routine "${routineName}": ${errorMessage}`);
            // Don't throw - cleanup failures shouldn't fail the test
        }
    }
}

export default new MyRoutinesPage();

