import { createFluentRoutineDetailPage } from './page-objects/routine-detail.page.js';
import { createFluentMyRoutinesPage } from './page-objects/my-routines.page.js';
import { createFluentManageExercisePage } from './page-objects/manage-exercise.page.js';
import { createFluentWeeklyReportPage } from './page-objects/weekly-report.page.js';
import * as kit from '@chauhaidang/xq-js-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from './enum.js';

/**
 * E2E workflow test for exercise management feature
 * Tests complete daily user journey: Create routine (API) → Add workout day (API) → Add exercises (UI) → Create snapshot (UI) → View report (UI) → Update exercises (UI) → Create snapshot again (UI) → View updated report (UI)
 * Setup uses API calls for speed and reliability, while exercise interactions use UI to test the feature
 */
describe('Exercise Daily Journey Workflow', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
    });

    beforeEach(async () => {
        trackRoutines = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    afterEach(async () => {
        // Clean up API-created routines (by ID)
        for (const routineId of trackRoutines) {
            try {
                await routinesApi.deleteRoutine(routineId);
            } catch (e) {
                console.log(`Failed to delete routine by ID: ${routineId}`, e);
            }
        }
    });

    context('Complete daily user journey with exercises', () => {
        it('should create routine → add workout day → add multiple exercises (totalReps, weight, totalSets) to muscle groups via UI → create snapshot (captures exercises) → view weekly report (verify exercise totals in UI) → update exercise values via UI → create snapshot again (captures updated exercises) → view weekly report (verify updated totals in UI)', async () => {
            const routineName = 'Exercise Test Routine ' + kit.generateRandomString(5);
            const routineDescription = 'Test routine for exercise workflow';
            const dayName = 'Monday Push Day';
            const muscleGroupName = 'Chest';
            const backMuscleGroupName = 'Back';
            
            // ===== SETUP: Create routine and workout day via API =====
            console.log('[Step 1] Creating routine via API...');
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: routineDescription,
                isActive: true,
            });
            
            trackRoutines.push(routine.data.id);
            console.log(`[Step 1] Created routine: ID=${routine.data.id}, Name=${routineName}`);
            
            console.log('[Step 2] Creating workout day via API...');
            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: dayName,
            });
            
            console.log(`[Step 2] Created workout day: ID=${workoutDay.data.id}, Name=${dayName}`);
            
            // Activate app and navigate to routine detail
            await browser.activateApp(bundleId);
            
            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();
            
            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail.waitForScreen().execute();
            
            // ===== ADD EXERCISES: Add multiple exercises to muscle groups via UI =====
            console.log('[Step 3] Adding exercises via UI...');
            
            // Add first exercise to Chest muscle group
            await routineDetail
                .tapAddExerciseForMuscleGroup(dayName, muscleGroupName)
                .execute();
            
            const manageExercise = createFluentManageExercisePage();
            await manageExercise
                .waitForScreen()
                .enterExerciseName('Bench Press')
                .enterTotalReps(30)
                .enterWeight(135)
                .enterTotalSets(3)
                .enterNotes('Focus on form')
                .tapSave()
                .execute();
            
            // Verify exercise appears in list
            await routineDetail
                .waitForScreen()
                .verifyExerciseInMuscleGroup(dayName, muscleGroupName, 'Bench Press')
                .execute();
            
            // Add second exercise to same muscle group (Chest)
            await routineDetail
                .tapAddExerciseForMuscleGroup(dayName, muscleGroupName)
                .execute();
            
            await manageExercise
                .waitForScreen()
                .enterExerciseName('Incline Dumbbell Press')
                .enterTotalReps(24)
                .enterWeight(50)
                .enterTotalSets(3)
                .tapSave()
                .execute();
            
            // Verify second exercise appears
            await routineDetail
                .waitForScreen()
                .verifyExerciseInMuscleGroup(dayName, muscleGroupName, 'Incline Dumbbell Press')
                .execute();
            
            // Add exercise to different muscle group (Back)
            await routineDetail
                .tapAddExerciseForMuscleGroup(dayName, backMuscleGroupName)
                .execute();
            
            await manageExercise
                .waitForScreen()
                .enterExerciseName('Pull-ups')
                .enterTotalReps(30)
                .enterWeight(0) // Bodyweight
                .enterTotalSets(4)
                .tapSave()
                .execute();
            
            // Verify exercise in Back muscle group
            await routineDetail
                .waitForScreen()
                .verifyExerciseInMuscleGroup(dayName, backMuscleGroupName, 'Pull-ups')
                .execute();
            
            // ===== FIRST SNAPSHOT: Create snapshot via UI that captures exercises =====
            console.log('[Step 4] Creating first snapshot via UI...');
            await routineDetail
                .waitForScreen()
                .tapCreateSnapshot()
                .waitForSnapshotCreationComplete()
                .execute();
            
            // ===== VIEW FIRST REPORT: Navigate to weekly report and verify exercise totals =====
            console.log('[Step 5] Viewing weekly report and verifying exercise totals...');
            // Navigate back to routines list first
            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();
            
            // Navigate to weekly report
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();
            
            const weeklyReport = createFluentWeeklyReportPage();
            await weeklyReport
                .waitForScreen()
                .waitForLoadingToComplete()
                .verifyReportDisplayed()
                .execute();
            
            // Verify exercise totals are displayed
            await weeklyReport
                .verifyExerciseTotalDisplayed('Bench Press', 30, 135 * 3) // totalReps: 30, totalWeight: 135 * 3 = 405
                .verifyExerciseTotalDisplayed('Incline Dumbbell Press', 24, 50 * 3) // totalReps: 24, totalWeight: 50 * 3 = 150
                .verifyExerciseTotalDisplayed('Pull-ups', 30, 0) // totalReps: 30, totalWeight: 0 (bodyweight)
                .verifyExerciseTotalsCount(3)
                .execute();
            
            // Verify muscle group totals (aggregated from exercises)
            await weeklyReport
                .verifyMuscleGroupTotal('Chest', 6) // 3 sets (Bench Press) + 3 sets (Incline Dumbbell Press) = 6
                .verifyMuscleGroupTotal('Back', 4) // 4 sets (Pull-ups)
                .execute();
            
            // ===== UPDATE EXERCISES: Update exercise values via UI =====
            console.log('[Step 6] Updating exercise values via UI...');
            // Navigate back to routines list
            await weeklyReport.tapBack().execute();
            await myRoutines.waitForScreen().execute();
            
            // Navigate back to routine detail
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();
            await routineDetail.waitForScreen().execute();
            
            // Tap on Bench Press exercise to edit
            await routineDetail
                .tapExerciseItem(dayName, muscleGroupName, 'Bench Press')
                .execute();
            
            // Update exercise values
            await manageExercise
                .waitForScreen()
                .enterTotalReps(36) // Updated from 30 to 36
                .enterWeight(145) // Updated from 135 to 145
                .enterTotalSets(4) // Updated from 3 to 4
                .tapSave()
                .execute();
            
            // Verify updated exercise appears with new values
            await routineDetail
                .waitForScreen()
                .verifyExerciseInMuscleGroup(dayName, muscleGroupName, 'Bench Press')
                .execute();
            
            // ===== SECOND SNAPSHOT: Create snapshot again via UI that captures updated exercises =====
            console.log('[Step 7] Creating second snapshot via UI...');
            await routineDetail
                .waitForScreen()
                .tapCreateSnapshot()
                .waitForSnapshotCreationComplete()
                .execute();
            
            // ===== VIEW UPDATED REPORT: Navigate to weekly report again and verify updated totals =====
            console.log('[Step 8] Viewing updated weekly report and verifying updated exercise totals...');
            // Navigate back to routines list
            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();
            
            // Navigate to weekly report again
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();
            
            await weeklyReport
                .waitForScreen()
                .waitForLoadingToComplete()
                .verifyReportDisplayed()
                .execute();
            
            // Verify updated exercise totals are displayed
            await weeklyReport
                .verifyExerciseTotalDisplayed('Bench Press', 36, 145 * 4) // Updated: totalReps: 36, totalWeight: 145 * 4 = 580
                .verifyExerciseTotalDisplayed('Incline Dumbbell Press', 24, 50 * 3) // Unchanged
                .verifyExerciseTotalDisplayed('Pull-ups', 30, 0) // Unchanged
                .verifyExerciseTotalsCount(3)
                .execute();
            
            // Verify updated muscle group totals
            await weeklyReport
                .verifyMuscleGroupTotal('Chest', 7) // Updated: 4 sets (Bench Press) + 3 sets (Incline Dumbbell Press) = 7
                .verifyMuscleGroupTotal('Back', 4) // Unchanged
                .execute();
            
            console.log('[Test Complete] All steps completed successfully!');
        });
    });
});
