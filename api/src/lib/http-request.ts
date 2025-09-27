/**
 * Executes a HTTP Request with option for custom header & body parameters
 * @param endpoint Request endpoint
 * @param options Object with optional keys for method, headers & body
 * @returns Returns the response as JSON
 */
export default async function httpRequest<TResponse, TBody = undefined>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
        headers?: HeadersInit,
        body?: TBody
    }
): Promise<TResponse>{
    const { method = 'GET', headers = {}, body } = options;

    const response = await fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json',
            ...headers
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
    });


    if (!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if(response.status === 204){
        return undefined as TResponse;
    }

    const result: TResponse = await response.json();
    return result;
}