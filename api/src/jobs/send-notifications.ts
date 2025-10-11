import { AttractionImport, AttractionChanges } from "../types/attraction";
import { getDbEnv } from '../db/client'
import { subscribedThemeparks, attractionSubscriptions } from "../db/schema";
import { SubscribedThemeparks } from "../types/subscribed-themeparks";
import { AttractionSubscription } from "../types/attraction-subscriptions";
import { KVParseError, SendNotificationError } from "../errors";
import httpRequest from "../lib/http-request";
import fetchAttractions from "../lib/fetch-attractions";

/**
 * Default function which connects all components to update the
 * waittime in cache & send notification about changes in waittime.
 * @param env Connection to Cloudflare
 */
// TODO: split into batches by cron, when more than 10 parks have to be fetched -> like update-attraction-list.ts
export default async function updateWaittimes(env: Env): Promise<void>{
    const db = getDbEnv(env);
    const subscribedParks = await db.select().from(subscribedThemeparks);
    const subscriptions = await db.select().from(attractionSubscriptions);

    for(let park of subscribedParks){
        const currentWaittimes = await fetchAttractions(park.apiName);
        const cachedWaittimes = await getJsonFromKV<AttractionImport[]>(env, park.apiName, []);

        const changes = compareWaittimes(cachedWaittimes, currentWaittimes);

        if(changes.length > 0){
            await notifyAboutChanges(subscriptions, changes, park);
            await cacheWaittimes(env, park.apiName, currentWaittimes);
        }
    }
}

/**
 * Saves the waittime of a specified themepark into KV namespace
 * @param env KV connection
 * @param themepark Themepark name to use as key in KV
 * @param waittimes Object with the waittimes to save in cache
 */
async function cacheWaittimes(env: Env, themepark: string, waittimes: AttractionImport[]){
    await env.waittime_cache.put(themepark, JSON.stringify(waittimes));
}

/**
 * Load value for specified key from KV and tries to parse as JSON
 * @param env KV connection
 * @param key Key to get value from
 * @param defaultValue Default value to return if key is empty/not defined
 * @returns Value of key from KV as defined type
 */
async function getJsonFromKV<T>(env: Env, key: string, defaultValue: T): Promise<T>{
    const cache = await env.waittime_cache.get(key);
    if(!cache) return defaultValue;

    try{
        return JSON.parse(cache) as T;
    }
    catch(e){
        throw new KVParseError(key, e);
    }
}

/**
 * Compares the waittimes of two objects from the type AttractionImport
 * @param cached The cached/old object of the waittimes
 * @param current The current object with the newer waittimes
 * @returns An object of type AttractionChanges (booleans for changes -> increase)
 */
function compareWaittimes(cached: AttractionImport[], current: AttractionImport[]): AttractionChanges[]{
    const cachedMap = new Map(cached.map(obj => [obj.code, obj]));
    let changes: AttractionChanges[] = [];

    current.forEach(attraction => {
        const cachedTime = cachedMap.get(attraction.code)?.waitingtime;
        const currentTime = attraction.waitingtime;

        if(attraction.status !== "opened") return;

        if((currentTime ?? 0) > (cachedTime ?? 0)){
            changes.push({
                apiCode: attraction.code,
                name: attraction.name,
                waittime: currentTime,
                hasChanged: true,
                increased: true
            });
        }
        else if((currentTime ?? 0) < (cachedTime ?? 0)){
            changes.push({
                apiCode: attraction.code,
                name: attraction.name,
                waittime: currentTime,
                hasChanged: true,
                increased: false
            })
        }
    });

    return changes;
}

/**
 * Sends a message to a specified webhook endpoint
 * @param webhookUrl The webhook's POST URL to send the request to
 * @param message The message to send to the webhook
 * @param type The type of notification (discord, slack, ntfy)
 */
// TODO: implement support for custom webhook providers (https://github.com/michivonah/themepark-assistant/issues/1) -> read templates from DB instead of switch case
async function sendNotification(webhookUrl: string, message: string, type: string): Promise<void>{
    try{
        let body: Record<string, string> | string;

        switch(type){
            case 'discord':
                body = {
                    'content':message
                }
                break;
            case 'slack':
                body = {
                    'text':message
                }
                break;
            case 'ntfy':
            default:
                body = message;
                break;
        }

        await httpRequest(webhookUrl, {
            method:'POST',
            body:body
        });
    }
    catch(e){
        throw new SendNotificationError(e);
    }
}

/**
 * Sends notification about changes in waittime to a defined list of subscribers
 * @param subscriptions Object of subscribed attractions with associated webhook URL
 * @param changes Object of the changes at waittime
 * @param themepark The API name of the themepark which should be checked for subscriptions
 */
async function notifyAboutChanges(subscriptions: AttractionSubscription[], changes: AttractionChanges[], themepark: SubscribedThemeparks){
    const changeMap = new Map(changes.map(c => [c.apiCode, c]));

    const subscribedChanges = subscriptions.filter(sub =>
        sub.themeparkApiName === themepark.apiName && changeMap.has(sub.attractionApiCode)
    );

    subscribedChanges.forEach(sub => {
        const change = changeMap.get(sub.attractionApiCode);

        if(change && change.hasChanged){
            const message = `Waittime for ${change.name} ${change.increased ? 'increased' : 'sank'} to ${change.waittime} minutes!`;
            sendNotification(sub.webhookUrl, message, sub.notificationProviderName);
        }
    });
}