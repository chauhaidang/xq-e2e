import { $ } from '@wdio/globals';

/**
 * Object definitions for the "Manage Exercise" screen
 * Contains only selectors/objects - no actions
 */
class ManageExerciseObjects {
    public get screenTitle() {
        return $('~Manage Exercise');
    }

    public get manageExerciseScreen() {
        return $('~manage-exercise-screen');
    }

    public get exerciseNameInput() {
        return $('~exercise-name-input');
    }

    public get totalRepsInput() {
        return $('~total-reps-input');
    }

    public get weightInput() {
        return $('~weight-input');
    }

    public get totalSetsInput() {
        return $('~total-sets-input');
    }

    public get notesInput() {
        return $('~notes-input');
    }

    public get saveButton() {
        return $('~save-exercise-button');
    }

    public get cancelButton() {
        return $('~cancel-exercise-button');
    }

    public get deleteButton() {
        return $('~delete-exercise-button');
    }

    public get backButton() {
        return $('//XCUIElementTypeButton[contains(@name, "back")]');
    }
}

export default new ManageExerciseObjects();
