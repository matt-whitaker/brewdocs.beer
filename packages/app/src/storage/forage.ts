import localforage from "localforage";
import {Entity} from "@/model/type";

export abstract class Forage<T extends Entity|string|number|boolean> {
    protected _forage: LocalForage;
    protected _name: string;

    constructor(name: string, driver?: string) {
        this._name = name;
        this._forage = localforage.createInstance(!driver ? { name } : { name, driver });
    }

    async get(id: string): Promise<T|null> {
        return this._forage.getItem(this.buildKey(id));
    }

    async list(): Promise<T[]> {
        let items: T[] = [];
        await this._forage.iterate((val: T) => {
            items.push(val)
        });
        return items;
    }

    async index(): Promise<Record<string, T>> {
        let items: Record<string, T> = {};
        await this._forage.iterate((val: T, key: string) => {
            items[key.replace(`${this._name}#`, "")] = val;
        });
        return items;
    }

    async save(id: string, item: T): Promise<T> {
        console.log(`Saving ${this._name}#${id}`, item);
        return await this._forage.setItem(this.buildKey(id), item);
    }

    async generateId(): Promise<string> {
        return `${(await this._forage.length()) + 1}`;
    }

    protected buildKey(id: string) {
        return `${this._name}#${id}`
    }
}