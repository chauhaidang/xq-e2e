import WeeklyReportTasks from './tasks/weekly-report.tasks.js';
import WorkoutDayTasks from './tasks/workout-day.tasks.js';
import RoutineDetailPage from './page-objects/routine-detail.page.js';
import MyRoutinesPage from './page-objects/my-routines.page.js';
import * as kit from '@chauhaidang/xq-js-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi, SnapshotsApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from '../support/utils/muscle-group-id.enum.js';

describe('Weekly Report', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let snapshotsApi: SnapshotsApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
        workoutDaySetsApi = new WorkoutDaySetsApi(configuration);
        snapshotsApi = new SnapshotsApi(configuration);
    });

    beforeEach(async () => {
        trackRoutines = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    after(async () => {
        for (const routineId of trackRoutines) {
            await routinesApi.deleteRoutine(routineId);
        }
    });

    context('When creating snapshot from UI', () => {
        it('should capture updated workout day sets when creating snapshot after adding another workout day', async () => {
            const routineName = 'SNAPSHOT routine' + kit.generateRandomString(5);
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: 'test update routine workout days set',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);

            // Create initial workout day with sets via API
            const workoutDay1 = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: 'Monday Upper',
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay1.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay1.data.id,
                muscleGroupId: MuscleGroupId.Back,
                numberOfSets: 3,
            });

            await browser.activateApp(bundleId);

            // Add another workout day with the same muscle group (increases total sets)
            await WorkoutDayTasks.addWorkoutDay(
                routineName,
                'Wednesday Upper',
                2,
                '3 sets of chest',
                '2 sets of back',
            );
            
            // Wait for screen to update
            await RoutineDetailPage.waitForScreen();
            await browser.pause(1000);
            
            // Create snapshot from UI (should capture both workout days)
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();
            
            // Navigate back to routines list
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();
            
            // View report and verify aggregated totals
            // Chest: 4 (Monday) + 3 (Wednesday) = 7
            // Back: 3 (Monday) + 2 (Wednesday) = 5
            await WeeklyReportTasks.navigateToReport(routine.data.id);
            await WeeklyReportTasks.verifyMuscleGroupTotal('Chest', 7);
            await WeeklyReportTasks.verifyMuscleGroupTotal('Back', 5);
        });

        it('should capture updated workout day sets when creating snapshot after editing existing workout day', async () => {
            const routine = await routinesApi.createRoutine({
                name: 'Test Routine ' + kit.generateRandomString(5),
                description: 'Test routine for snapshot after edit',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);

            // Create initial workout day with sets via API
            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: 'Monday Upper',
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            await browser.activateApp(bundleId);
            
            // Navigate to routine detail
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routine.data.name);
            await RoutineDetailPage.waitForScreen();
            
            // Edit existing workout day to increase sets (4 -> 6)
            await WorkoutDayTasks.editWorkoutDaySet(
                workoutDay.data.dayName,
                MuscleGroupId.Chest,
                6
            );
            
            // Create snapshot from UI (should capture updated sets: 6)
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();
            
            // Navigate back to routines list
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();
            
            // View report and verify updated total (6 sets, not 4)
            await WeeklyReportTasks.navigateToReport(routine.data.id);
            await WeeklyReportTasks.verifyMuscleGroupTotal('Chest', 6);
        });
    });
});

