import RoutineTasks from './tasks/routine.tasks.js';
import WorkoutDayTasks from './tasks/workout-day.tasks.js';
import RoutineDetailPage from './page-objects/routine-detail.page.js';
import * as kit from '@chauhaidang/xq-js-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from '../support/utils/muscle-group-id.enum.js';

describe('Manage Routine', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
        workoutDaySetsApi = new WorkoutDaySetsApi(configuration);
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

    context('When there is no routine', () => {
        const routineName = 'UL4' + kit.generateRandomString(5);
        const routineDescription = 'Upper Lower 4 days split';

        it('should let me create new routine with detail splits', async () => {
            await browser.activateApp(bundleId);
            await RoutineTasks.createRoutine(routineName, routineDescription);
            await RoutineTasks.verifyRoutineExists(routineName);
            await WorkoutDayTasks.addWorkoutDay(
                routineName,
                'Monday upper body',
                '4 sets of chest',
                '2 sets of back',
            );
            await RoutineDetailPage.tapBack();
            await RoutineTasks.deleteRoutine(routineName);
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
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            await browser.activateApp(bundleId);
            await WorkoutDayTasks.editWorkoutDaySet(routine.data.name, workoutDay.data.dayName, MuscleGroupId.Chest, 6);
            await WorkoutDayTasks.verifyWorkoutDaySet(routine.data.name, workoutDay.data.dayName, 'Chest', 6);
        });
    });
});
