import localforage from "localforage";
import {extractItems} from "@/utils/forage";
import {Entity} from "@/model/type";

export abstract class Forage<T extends Entity> {
    protected _forage: LocalForage;
    protected _name: string;

    constructor(name: string) {
        this._name = name;
        this._forage = localforage.createInstance({ name });
    }

    async list(): Promise<T[]> {
        return await extractItems(this._forage) as T[];
    }

    async save(item: T): Promise<T> {
        console.log(`Updating item ${item.id}`, item);
        return await this._forage.setItem(this.buildKey(item.id), item);
    }

    async generateId(): Promise<string> {
        return `${(await this._forage.length()) + 1}`;
    }

    protected buildKey(id: string) {
        return `${this._name}#${id}`
    }
}