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
        default:
            console.log('its me - the cron router');
            break;
    }
}