// typesafe api fetch function
export default async function fetchData<T>(endpoint: string, headers: Record<string, string> = {}, method: string = 'GET'): Promise<T>{
    async function gatherResponse(response: Response): Promise<T>{
        return await response.json(); 
    }

    const response: Response = await fetch(endpoint,  { method: method, headers: headers});

    if (!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: T = await gatherResponse(response);
    return result;
}