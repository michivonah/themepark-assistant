// Cron Router
import { updateThemeparkData } from "./update-themepark-data";

export default async function cronRouter(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
){
    switch (event.cron){
        case '* * * * *':
            console.log('every minute');
            break;
        case '0 4 7,14,21,28 * *':
            await updateThemeparkData(env);
            break;
        default:
            console.log('its me - the cron router');
            break;
    }
}