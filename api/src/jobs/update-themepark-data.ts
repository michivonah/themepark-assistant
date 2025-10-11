import { getDbEnv } from '../db/client'
import { themepark } from '../db/schema'
import { countryCodesDE } from '../lib/countries'
import { FetchError, ThemeparkUpdateError } from '../errors'
import httpRequest from '../lib/http-request'
import asyncBatchJob from '../lib/async-batch-job'

interface Park {
    id: string,
    name: string,
    land: string
}

/**
 * Fetches a list of available themeparks from an external API
 * @param endpoint Endpoint where to fetch data from (default: https://api.wartezeiten.app/v1/parks)
 * @param lang Language specified in the request's header (default: de)
 * @returns Object with all themeparks
 */
async function fetchThemeparks(
    endpoint: string = "https://api.wartezeiten.app/v1/parks",
    lang: string = "de"
): Promise<Park[]>{
    try{
        const headers = {
            'language':lang
        }
        const result = await httpRequest<Park[]>(endpoint, {
            headers: headers
        });
        return result;
    }
    catch(e){
        throw new FetchError(e);
    }
}

/**
 * Loads themeparks from API and compare to current themeparks in DB.
 * Adds the missing themeparks to the DB in multiple batches
 * @param env DB Connection
 */
export async function updateThemeparkData(env: Env): Promise<void>{
    const availableThemeparks = await fetchThemeparks();

    try{
        // get current list of themeparks from DB
        const db = getDbEnv(env);
        const currentThemeparks = await db.select({
            apiName: themepark.apiName
        }).from(themepark);

        // filter to get only the new parks
        const newParks = availableThemeparks.filter(
            park => currentThemeparks.length == 0 || !currentThemeparks.some(id => id.apiName == park.id)
        ).map(park => ({
            name: park.name,
            apiName: park.id,
            countrycode: countryCodesDE[park.land]
        }));

        // only run queries, when new parks were found
        if (newParks.length != 0){
            // split into multiple batches, to apply with D1's limits
            await asyncBatchJob(newParks, 20, async (batch) => {
                await db.insert(themepark).values(batch);
            });
        }
    }
    catch(e){
        throw new ThemeparkUpdateError(e);
    }
}