import { getDbEnv } from '../db/client'
import { attraction, themepark } from '../db/schema'
import { inArray } from 'drizzle-orm'
import { Attraction } from '../types/attraction'
import { ThemeparkSelect } from '../types/themepark'
import asyncBatchJob from '../lib/async-batch-job'
import fetchAttractions from '../lib/fetch-attractions'

type ThemeparkAPI = Pick<ThemeparkSelect, "apiName" | "id">;

/**
 * Return an object of all themeparks saved in the database
 * @param env DB Connection
 * @returns Object of themeparks with api name & id from internal DB
 */
async function getThemeparks(env: Env): Promise<ThemeparkAPI[]>{
    try{
        const db = getDbEnv(env);
        const themeparks: ThemeparkAPI[] = await db.select({
            apiName: themepark.apiName,
            id: themepark.id
        }).from(themepark);

        return themeparks;
    }
    catch(e){
        throw new Error(`Failed to get themeparks from database: ${e}`);
    }
}

/**
 * Return an object of all attractions from a defined park saved in the database
 * @param env DB Connection
 * @param parks Object of themeparks to get attractions from
 * @returns Object of attractions
 */
async function getAttractionsByParks(env: Env, parks: ThemeparkAPI[]): Promise<Attraction[]>{
    try{
        const db = getDbEnv(env);

        const parkIds: number[] = parks.map(p => p.id);

        const attractions: Attraction[] = await db.select({
            name: attraction.name,
            apiCode: attraction.apiCode,
            themeparkId: attraction.themeparkId
        }).from(attraction)
        .where(inArray(attraction.themeparkId, parkIds));

        return attractions;
    }
    catch(e){
        throw new Error(`Failed to get attractions from database: ${e}`);
    }
}

/**
 * Imports attraction of the specified themeparks into the DB.
 * Interacts with the dependant functions.
 * @param env DB Connection
 * @param parks Object of the themeparks from which the attractions have to be imported
 */
async function importAttractionsByParks(env: Env, parks: ThemeparkAPI[]): Promise<void>{
    try{
        const db = getDbEnv(env);
        
        const currentAttractions = await getAttractionsByParks(env, parks);
        for (let park of parks){
            const attractions = await fetchAttractions(park.apiName);

            // get only the new attractions
            const importableAttractions = attractions.filter(
                attractionIndex => currentAttractions.length == 0 || !currentAttractions.some(id => id.apiCode == attractionIndex.code)
            ).map(attractionIndex => ({
                name: attractionIndex.name,
                apiCode: attractionIndex.code,
                themeparkId: park.id
            }));

            // only run the import when new attractions available
            if (importableAttractions.length > 0){
                await asyncBatchJob(importableAttractions, 16, async (batch) => {
                    await db.insert(attraction).values(batch);
                });
            }
        }
    }
    catch(e){
        throw new Error(`Failed to import attractions into database: ${e}`);
    }
}

/**
 * Does create batches of themeparks from a timestamp & cron statement,
 * so the imports can be done splitted into multiple batches.
 * The function is exported, so that it can be run via background task.
 * @param env DB Connection
 * @param timestamp Current timestamp when function is run
 * @param cron The cron statement specified to run the background jobs; used for batch size calculation
 */
export async function batchAttractionImport(env: Env, timestamp: number, cron: string): Promise<void>{
    try{
        const themeparks = await getThemeparks(env); // all themeparks
        const executionHour = new Date(timestamp).getUTCHours(); // current hour, in which job is executed
        const executionTimes = getExecutionCountFromCron(cron, 1); // how often the job is executed

        const batchSize = Math.ceil(themeparks.length / executionTimes); // calculate batch size, so that each park gets updated
        const hourIndex = executionHour - 1;

        // time examples
        // 01:00 -> 1757811600000
        // 02:00 -> 1757815200000
        // 03:00 -> 1757818800000

        const batch = themeparks.slice(hourIndex * batchSize, (hourIndex + 1) * batchSize); // slice array into right batch

        // import attractions from current time batch
        await importAttractionsByParks(env, batch);
    }
    catch(e){
        throw new Error(`Failed to split attraction import by time: ${e}`);
    }
}

/**
 * Calculates how often cron job gets executed
 * @param cron Cron scheme
 * @param partNr Which part of cron scheme should be checked
 * @returns Number of execution times
 */
function getExecutionCountFromCron(cron: string, partNr: number): number{
    const parts = cron.split(" ");
    const specifiedPart = parts[partNr];

    switch (true){
        case specifiedPart.includes("-"):
            const [start, end] = specifiedPart.split("-").map(Number);
            return end - start + 1;
        case specifiedPart.includes(","):
            return specifiedPart.split(",").length;
        case specifiedPart === "*":
            return 24;
        default:
            return 1;
    }
}