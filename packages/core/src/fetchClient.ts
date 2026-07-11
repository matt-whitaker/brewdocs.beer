export type FetchClientConfig = {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export type FetchClient = {
    request: <T>(path: string, init?: RequestInit) => Promise<T>;
    get: <T>(path: string, init?: RequestInit) => Promise<T>;
}

export function createFetchClient({ baseUrl = "", headers: defaultHeaders = {} }: FetchClientConfig = {}): FetchClient {
    async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
        const response = await fetch(`${baseUrl}${path}`, {
            ...init,
            headers: { ...defaultHeaders, ...init.headers }
        });

        if (!response.ok) {
            throw new Error(`Request to ${path} failed: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    return {
        request,
        get: (path, init) => request(path, { ...init, method: "GET" })
    };
}
