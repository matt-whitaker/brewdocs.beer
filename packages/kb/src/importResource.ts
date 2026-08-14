import {createFetchClient} from "@brewdocs.beer/core";
import {KbAdditive, KbEquipment, KbGrain, KbHop, KbRecipe, KbRecipeTemplate, KbYeast} from "./models";

interface ResourceTypeMap {
    hops: KbHop;
    grains: KbGrain;
    yeasts: KbYeast;
    recipes: KbRecipe;
    additives: KbAdditive;
    equipment: KbEquipment;
    "recipe-templates": KbRecipeTemplate;
}

type ResourceFile<T> = {
    version: string;
    data: T[];
}

// same-origin path: works today served from the app's own static assets, and
// requires no app-code changes once /kb/* is routed to a dedicated CDN origin
const client = createFetchClient({ baseUrl: "/kb" });

function staleDistMessage(resource: string, detail: string) {
    return `Failed to load static resource: ${resource} — ${detail}. `
        + `/kb/${resource}.json is most likely missing from packages/kb/dist (the dev server answers a missing path with index.html and a 200). `
        + `Rebuild it with: npm run build -w packages/kb`;
}

async function importResource<K extends keyof ResourceTypeMap>(resource: K): Promise<ResourceTypeMap[K][]> {
    let file: ResourceFile<ResourceTypeMap[K]>;

    try {
        file = await client.get<ResourceFile<ResourceTypeMap[K]>>(`/${resource}.json`);
    } catch (e) {
        const msg = e instanceof SyntaxError
            ? staleDistMessage(resource, "the response body was not JSON")
            : `Failed to load static resource: ${resource}`;
        console.error(msg, e);
        throw new Error(msg);
    }

    if (!Array.isArray(file?.data)) {
        const msg = staleDistMessage(resource, "the response was JSON but carried no data array");
        console.error(msg, file);
        throw new Error(msg);
    }

    return file.data;
}

export default importResource;
