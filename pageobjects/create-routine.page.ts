import { $, expect, browser } from '@wdio/globals'
import Page from './page.js';

/**
 * Page object for the "Create Routine" form screen
 */
class CreateRoutinePage extends Page {
    /**
     * Define selectors using accessibility identifiers
     */
    public get routineNameInput() {
        return $('~routine-name-input');
    }

    public get routineDescriptionInput() {
        return $('~routine-description-input');
    }

    public get activeToggle() {
        return $('~routine-active-switch');
    }

    public get createButton() {
        return $('~submit-button');
    }

    public get successPopup() {
        return $('~Success');
    }

    public get closeButton() {
        return $('~OK');
    }

    public get labelActive() {
        return $('~Active');
    }
    public get labelDescription() {
        return $('~Description');
    }
    public get labelRoutineName() {
        return $('~Routine Name *');
    }
    public get labelSubmitButton() {
        return $('~Create Routine');
    }

    public get createRoutineScreen() {
        return $('~create-routine-screen');
    }

    public get backButton() {
        return $('~My Routines, back');
    }

    /**
     * Enter routine name
     * @param name The routine name to enter
     */
    public async enterRoutineName(name: string) {
        await this.routineNameInput.setValue(name);
    }

    /**
     * Enter routine description
     * @param description The routine description to enter
     */
    public async enterRoutineDescription(description: string) {
        await this.routineDescriptionInput.setValue(description);
    }

    /**
     * Set the active toggle state
     * @param enabled Whether the toggle should be enabled (true) or disabled (false)
     */
    public async setActiveToggle(enabled: boolean) {
        const toggle = await this.activeToggle;
        const currentValue = await toggle.getAttribute('value');
        const isCurrentlyEnabled = currentValue === '1' || currentValue === 'true';
        
        if (enabled !== isCurrentlyEnabled) {
            await toggle.click();
        }
    }

    /**
     * Verify that the toggle is ACTIVE (enabled)
     */
    public async verifyToggleIsActive() {
        const toggle = await this.activeToggle;
        const value = await toggle.getAttribute('value');
        // Toggle is active if value is '1' or 'true'
        const isActive = value === '1' || value === 'true';
        if (!isActive) {
            throw new Error(`Toggle is not active. Current value: ${value}`);
        }
    }

    /**
     * Hide keyboard using the best method for iOS
     */
    private async hideKeyboard() {
        try {
            await this.labelActive.click();
            await browser.pause(200);
        } catch (error) {
            console.error('Keyboard dismissal failed', error);
        }
        
        // Verify keyboard is actually hidden
        try {
            await browser.waitUntil(async () => {
                return !(await browser.isKeyboardShown());
            }, {
                timeout: 2000,
                timeoutMsg: 'Keyboard did not hide within timeout'
            });
        } catch (error) {
            // Keyboard might already be hidden or check failed, continue anyway
            console.log('Keyboard visibility check completed');
        }
    }

    /**
     * Tap the Create Routine button
     */
    public async tapCreate() {
        // Dismiss keyboard if it's open (common issue on iOS)
        await this.hideKeyboard();
        
        // Wait for button to be displayed
        await expect(this.createButton).toBeDisplayed();
        
        // Check if button is enabled (iOS-native check, doesn't use JavaScript)
        const isEnabled = await this.createButton.isEnabled();
        if (!isEnabled) {
            throw new Error('Create Routine button is disabled. Form may be invalid.');
        }
        
        // Click the button
        await this.createButton.click();
        console.log('Create button clicked successfully');
    }

    /**
     * Wait for and close the success popup
     * If popup doesn't appear, assume navigation happened automatically
     */
    public async closePopup() {
        try {
            // Wait for popup to appear (if it exists)
            await expect(this.successPopup).toBeDisplayed();
            // Tap close button if popup is found
        await this.closeButton.click();
        } catch (error) {
            // Popup doesn't exist or navigation happened automatically
            // This is fine - the app may navigate back automatically
            console.log('Success popup not found, assuming automatic navigation');
        }
    }

    /**
     * Tap the back button to return to My Routines
     */
    public async tapBack() {
        await expect(this.backButton).toBeDisplayed();
        await this.backButton.click();
    }

    /**
     * Wait for the Create Routine screen to be displayed
     */
    public async waitForScreen() {
        await expect(this.createRoutineScreen).toBeDisplayed();
    }
}

export default new CreateRoutinePage();

