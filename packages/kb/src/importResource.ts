import {createFetchClient} from "@brewdocs.beer/core";
import {KbGrain, KbHop, KbRecipe, KbYeast} from "./models";

interface ResourceTypeMap {
    hops: KbHop;
    grains: KbGrain;
    yeasts: KbYeast;
    recipes: KbRecipe;
}

type ResourceFile<T> = {
    version: string;
    data: T[];
}

// same-origin path: works today served from the app's own static assets, and
// requires no app-code changes once /kb/* is routed to a dedicated CDN origin
const client = createFetchClient({ baseUrl: "/kb" });

async function importResource<K extends keyof ResourceTypeMap>(resource: K): Promise<ResourceTypeMap[K][]> {
    try {
        const file = await client.get<ResourceFile<ResourceTypeMap[K]>>(`/${resource}.json`);
        return file.data;
    } catch (e) {
        const msg = `Failed to load static resource: ${resource}`
        console.error(msg, e);
        throw new Error(msg)
    }
}

export default importResource;
