import MyRoutinesPage from '../pageobjects/my-routines.page.js';
import CreateRoutinePage from '../pageobjects/create-routine.page.js';
import RoutineDetailPage from '../pageobjects/routine-detail.page.js';
import * as kit from '@chauhaidang/xq-js-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from '../utils/muscle-group-id.enum.js';

describe('Manage Routine', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let trackRoutines: number[] = [];

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
        workoutDaySetsApi = new WorkoutDaySetsApi(configuration);
    });


    beforeEach(async () => {
        await browser.terminateApp('com.xqfitness.app');
    });

    afterEach(async () => {
        for (const routineId of trackRoutines) {
            await routinesApi.deleteRoutine(routineId);
        }
    });

    context('When there is no routine', () => {
        const routineName = 'UL4' + kit.generateRandomString(5);
        const routineDescription = 'Upper Lower 4 days split';

        it('should let me create new routine with detail splits', async () => {
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapCreateRoutine();
            await CreateRoutinePage.enterRoutineName(routineName);
            await CreateRoutinePage.enterRoutineDescription(routineDescription);
            await CreateRoutinePage.verifyToggleIsActive();
            await CreateRoutinePage.tapCreate();
            await CreateRoutinePage.closePopup();
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.verifyRoutineExists(routineName);
            await MyRoutinesPage.tapRoutineItem(routineName);
            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.addWorkoutDay('Monday upper body', '4 sets of chest', '2 sets of back', '3 sets of shoulder', '4 sets of arm');
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.tapDeleteRoutine(routineName);
        });
    });

    context('When there is a routine', () => {
        it('should let me update the routine workout days set', async () => {

            const routine = await routinesApi.createRoutine({
                name: 'UL4' + kit.generateRandomString(5),
                description: 'test update routine workout days set',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);

            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 2,
                dayName: 'Wednesday Upper A',
                notes: 'Upper A note',
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
                notes: 'Upper A chest sets note',
            });

            await browser.activateApp('com.xqfitness.app');
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routine.data.name);
            await RoutineDetailPage.editWorkoutDaySet(workoutDay.data.dayName, MuscleGroupId.Chest, 6);
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data.dayName, 'Chest', 6);
        });
    });
});
