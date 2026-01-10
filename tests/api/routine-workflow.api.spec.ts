import * as assert from 'node:assert';
import * as kit from '@chauhaidang/xq-js-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi} from 'xq-fitness-write-client';
import {Configuration as ReadConfiguration, RoutinesApi as ReadRoutinesApi} from 'xq-fitness-read-client';
import { MuscleGroupId } from '../enum.js';

/**
 * API-only test for routine workflow
 * This test demonstrates the pattern for API-only tests without browser/app dependencies
 */
describe('Routine Workflow API Tests', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let readRoutinesApi: ReadRoutinesApi;
    let trackRoutines: number[] = [];

    const writeServiceBasePath = process.env.GATEWAY_URL 
        ? `${process.env.GATEWAY_URL}/xq-fitness-write-service/api/v1`
        : 'http://localhost:8080/xq-fitness-write-service/api/v1';
    
    const readServiceBasePath = process.env.GATEWAY_URL
        ? `${process.env.GATEWAY_URL}/xq-fitness-read-service/api/v1`
        : 'http://localhost:8080/xq-fitness-read-service/api/v1';

    before(() => {
        // Initialize write service API clients
        const writeConfiguration = new Configuration({
            basePath: writeServiceBasePath,
        });
        routinesApi = new RoutinesApi(writeConfiguration);
        workoutDaysApi = new WorkoutDaysApi(writeConfiguration);
        workoutDaySetsApi = new WorkoutDaySetsApi(writeConfiguration);

        // Initialize read service API client
        const readConfiguration = new ReadConfiguration({
            basePath: readServiceBasePath,
        });
        readRoutinesApi = new ReadRoutinesApi(readConfiguration);
    });

    beforeEach(() => {
        trackRoutines = [];
    });

    afterEach(async () => {
        // Clean up routines created in this test
        for (const routineId of trackRoutines) {
            try {
                await routinesApi.deleteRoutine(routineId);
            } catch (error) {
                console.error(`Failed to delete routine ${routineId}:`, error);
            }
        }
    });

    context('When creating a routine via API', () => {
        it('should create a routine with workout days and sets', async () => {
            const routineName = 'API Test Routine ' + kit.generateRandomString(5);
            const routineDescription = 'Test routine created via API';

            // Create routine
            const routineResponse = await routinesApi.createRoutine({
                name: routineName,
                description: routineDescription,
                isActive: true,
            });

            assert.strictEqual(routineResponse.status, 201);
            assert.strictEqual(routineResponse.data.name, routineName);
            assert.strictEqual(routineResponse.data.description, routineDescription);
            assert.strictEqual(routineResponse.data.isActive, true);

            const routineId = routineResponse.data.id;
            trackRoutines.push(routineId);

            // Create workout day
            const workoutDayResponse = await workoutDaysApi.createWorkoutDay({
                routineId: routineId,
                dayNumber: 1,
                dayName: 'Monday Upper Body',
            });

            assert.strictEqual(workoutDayResponse.status, 201);
            assert.strictEqual(workoutDayResponse.data.dayName, 'Monday Upper Body');
            assert.strictEqual(workoutDayResponse.data.dayNumber, 1);

            const workoutDayId = workoutDayResponse.data.id;

            // Create workout day sets
            const chestSetResponse = await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDayId,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            assert.strictEqual(chestSetResponse.status, 201);
            assert.strictEqual(chestSetResponse.data.muscleGroupId, MuscleGroupId.Chest);
            assert.strictEqual(chestSetResponse.data.numberOfSets, 4);

            const backSetResponse = await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDayId,
                muscleGroupId: MuscleGroupId.Back,
                numberOfSets: 3,
            });

            assert.strictEqual(backSetResponse.status, 201);
            assert.strictEqual(backSetResponse.data.muscleGroupId, MuscleGroupId.Back);
            assert.strictEqual(backSetResponse.data.numberOfSets, 3);

            // Verify routine via read service
            const getRoutineResponse = await readRoutinesApi.getRoutineById(routineId);
            assert.strictEqual(getRoutineResponse.status, 200);
            assert.strictEqual(getRoutineResponse.data.name, routineName);
            assert.ok(getRoutineResponse.data.workoutDays);
            assert.strictEqual(getRoutineResponse.data.workoutDays.length, 1);
            assert.strictEqual(getRoutineResponse.data.workoutDays[0].dayName, 'Monday Upper Body');
        });

        it('should update routine workout day sets', async () => {
            const routineName = 'API Update Test ' + kit.generateRandomString(5);

            // Create routine
            const routineResponse = await routinesApi.createRoutine({
                name: routineName,
                description: 'Test routine for update workflow',
                isActive: true,
            });

            const routineId = routineResponse.data.id;
            trackRoutines.push(routineId);

            // Create workout day
            const workoutDayResponse = await workoutDaysApi.createWorkoutDay({
                routineId: routineId,
                dayNumber: 1,
                dayName: 'Wednesday Upper A',
            });

            const workoutDayId = workoutDayResponse.data.id;

            // Create initial set
            const initialSetResponse = await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDayId,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            const setId = initialSetResponse.data.id;

            // Update set
            const updateResponse = await workoutDaySetsApi.updateWorkoutDaySet(setId,{
               numberOfSets: 6,
            }, workoutDayId, MuscleGroupId.Chest);

            assert.strictEqual(updateResponse.status, 200);
            assert.strictEqual(updateResponse.data.numberOfSets, 6);
        });
    });

    context('When managing multiple routines', () => {
        it('should handle multiple routines independently', async () => {
            const routine1Name = 'API Routine 1 ' + kit.generateRandomString(5);
            const routine2Name = 'API Routine 2 ' + kit.generateRandomString(5);

            // Create first routine
            const routine1Response = await routinesApi.createRoutine({
                name: routine1Name,
                description: 'First test routine',
                isActive: true,
            });
            const routine1Id = routine1Response.data.id;
            trackRoutines.push(routine1Id);

            // Create second routine
            const routine2Response = await routinesApi.createRoutine({
                name: routine2Name,
                description: 'Second test routine',
                isActive: false,
            });
            const routine2Id = routine2Response.data.id;
            trackRoutines.push(routine2Id);

            // Verify both routines exist
            const getRoutine1Response = await readRoutinesApi.getRoutineById(routine1Id);
            assert.strictEqual(getRoutine1Response.status, 200);
            assert.strictEqual(getRoutine1Response.data.name, routine1Name);
            assert.strictEqual(getRoutine1Response.data.isActive, true);

            const getRoutine2Response = await readRoutinesApi.getRoutineById(routine2Id);
            assert.strictEqual(getRoutine2Response.status, 200);
            assert.strictEqual(getRoutine2Response.data.name, routine2Name);
            assert.strictEqual(getRoutine2Response.data.isActive, false);
        });
    });
});

