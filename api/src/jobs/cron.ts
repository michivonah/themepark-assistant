// Cron Router
import { updateThemeparkData } from "./update-themepark-data";
import { batchAttractionImport } from "./update-attraction-list";
import updateWaittimes from "./send-notifications";

export default async function cronRouter(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
){
    switch (event.cron){
        case '*/5 * * * *':
            await updateWaittimes(env);
            break;
        case '0 1-6 7,14,21,28 * *':
            await batchAttractionImport(env, event.scheduledTime, event.cron);
            break;
        case '0 4 1 * *':
            await updateThemeparkData(env);
            break;
        default:
            console.log('its me - the cron router');
            break;
    }
}