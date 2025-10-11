import { AttractionImport } from '../types/attraction'
import httpRequest from '../lib/http-request'
import { FetchError } from '../errors';

/**
 * Fetching the attractions from a specified park
 * @param park API Code for request themepark
 * @param endpoint Endpoint where to fetch data from (default: https://api.wartezeiten.app/v1/parks)
 * @param lang Language used for API request
 * @returns Interface with attraction code & name
 */
export default async function fetchAttractions(
    park: string,
    endpoint: string = "https://api.wartezeiten.app/v1/waitingtimes",
    lang: string = 'de'
): Promise<AttractionImport[]>{
    try{
        const headers = {
            'language':lang,
            'park':park
        };

        const result = await httpRequest<AttractionImport[]>(endpoint, {
            headers: headers
        });
        return result;
    }
    catch(e){
        throw new FetchError(e, endpoint);
    }
}