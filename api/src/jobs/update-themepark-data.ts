import { getDbEnv } from '../db/client'
import { themepark } from '../db/schema'
import { countryCodesDE } from '../lib/countries'
import fetchData from '../lib/fetch-data'

interface Park {
    id: string,
    name: string,
    land: string
}

export async function updateThemeparkData(env: Env): Promise<void>{
    try{
        // fetch all available themeparks from external API
        const endpoint = "https://api.wartezeiten.app/v1/parks"
        const headers = {
            'language':'de'
        }
        const availableThemeparks = await fetchData<Park[]>(endpoint, headers);

        // internal db queries
        const db = getDbEnv(env);
        const currentThemeparks = await db.select({
            apiName: themepark.apiName
        }).from(themepark);

        let newParks = [];

        for (let park of availableThemeparks){
            if(currentThemeparks.length == 0 || !currentThemeparks.some(id => id.apiName == park.id)){ // checks if id already exists in db
                newParks.push({
                    name: park.name,
                    apiName: park.id,
                    countrycode: countryCodesDE[park.land]
                });
                console.log(`${park.id} is missing in DB`)
            }
        }

        // only run queries, when new parks were found
        if (newParks.length != 0){
            // split into multiple batches, to apply with D1's limits
            const batchSize = 20;
            for (let i = 0; i < newParks.length; i += batchSize){
                const batch = newParks.slice(i, i + batchSize);
                await db.insert(themepark).values(batch);
            }
        }
    }
    catch(e){
        console.error(`Failed to update themepark data: ${e}`);
    }
}