import { browser } from '@wdio/globals';
import MyRoutinesPage from '../page-objects/my-routines.page.js';
import RoutineDetailPage from '../page-objects/routine-detail.page.js';
import { MuscleGroupId } from '../../support/utils/muscle-group-id.enum.js';

/**
 * Business tasks for workout day operations
 * Provides stable business operations that compose page object actions
 * Handles UI variations internally (navigation, popups, keyboard)
 */
class WorkoutDayTasks {
    /**
     * Add a workout day to a routine
     * Handles UI variations: navigation, keyboard dismissal, scrolling, alerts
     * @param routineName The name of the routine
     * @param dayName The name of the workout day
     * @param dayNumberOrFirstSet The day number (if number) or first set string (if string, default: 1)
     * @param sets Array of set strings in format "X sets of muscleGroup"
     */
    async addWorkoutDay(routineName: string, dayName: string, dayNumberOrFirstSet?: number | string, ...sets: string[]) {
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapRoutineItem(routineName);
        await RoutineDetailPage.waitForScreen();
        await RoutineDetailPage.addWorkoutDay(dayName, dayNumberOrFirstSet, ...sets);
    }

    /**
     * Edit a workout day set
     * Handles UI variations: navigation, editing flow, alerts
     * @param routineName The name of the routine
     * @param dayName The name of the workout day
     * @param muscleGroupId The muscle group ID
     * @param numberOfSets The number of sets
     */
    async editWorkoutDaySet(dayName: string, muscleGroupId: MuscleGroupId, numberOfSets: number) {
        await RoutineDetailPage.waitForScreen();
        await RoutineDetailPage.editWorkoutDaySet(dayName, muscleGroupId, numberOfSets);
    }

    /**
     * Verify a workout day set
     * Handles UI variations: navigation, element visibility
     * @param routineName The name of the routine
     * @param dayName The name of the workout day
     * @param muscleGroupName The muscle group name
     * @param numberOfSets The number of sets
     */
    async verifyWorkoutDaySet(routineName: string, dayName: string, muscleGroupName: string, numberOfSets: number) {
        // Navigate to routine detail
        await MyRoutinesPage.waitForScreen();
        await MyRoutinesPage.tapRoutineItem(routineName);
        
        // Wait for screen to load
        await browser.pause(1000);
        
        // Verify workout day set
        await RoutineDetailPage.waitForScreen();
        await RoutineDetailPage.verifyWorkoutDaySet(dayName, muscleGroupName, numberOfSets);
    }
}

export default new WorkoutDayTasks();
