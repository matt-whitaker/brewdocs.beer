import {Forage} from "@/storage/forage";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Recipe from "@/model/recipe";

type KbResourceMap = {
    grains: Grain[];
    hops: Hop[];
    yeasts: Yeast[];
    recipes: Recipe[];
}

export class KbStorage extends Forage<KbResourceMap[keyof KbResourceMap]> {
    constructor() {
        super("kb");
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
