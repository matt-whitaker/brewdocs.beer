import {KbGrain, KbHop, KbYeast, KbRecipe} from "@brewdocs.beer/kb";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";

type KbResourceMap = {
    grains: KbGrain[];
    hops: KbHop[];
    yeasts: KbYeast[];
    recipes: KbRecipe[];
};

export class KbStorage extends Forage<KbResourceMap[keyof KbResourceMap]> {
    constructor() {
        super("kb", LF_INDEXEDDB);
    }

    async getResource<K extends keyof KbResourceMap>(resource: K): Promise<KbResourceMap[K]|null> {
        return this.get(resource) as Promise<KbResourceMap[K]|null>;
    }

    async saveResource<K extends keyof KbResourceMap>(resource: K, data: KbResourceMap[K]): Promise<KbResourceMap[K]> {
        return this.save(resource, data) as Promise<KbResourceMap[K]>;
    }
}

const kbStorage = new KbStorage();
export default kbStorage;
