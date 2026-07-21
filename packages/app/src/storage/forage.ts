import { v4 as uuidV4} from "uuid";
import localforage from "@/storage/localforage";

export const ID_REGEX = /^.*?#(.*)$/;

export abstract class Forage<T> {
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
        const items: T[] = [];
        await this._forage.iterate((val: T) => {
            items.push(val);
        });
        return items;
    }

    async index(): Promise<Record<string, T>> {
        const items: Record<string, T> = {};
        await this._forage.iterate((val: T, key: string) => {
            items[key.replace(`${this._name}#`, "")] = val;
        });
        return items;
    }

    async save(id: string, item: T): Promise<T> {
        console.log(`Saving ${this._name}#${id}`, item);
        return await this._forage.setItem(this.buildKey(id), item);
    }

    async delete(id: string): Promise<void>{
        console.log(`Deleting ${this._name}#${id}`);
        return await this._forage.removeItem(this.buildKey(id));
    }

    async generateId(): Promise<string> {
        return `${uuidV4()}`;
    }

    protected buildKey(id: string) {
        return `${this._name}#${id}`;
    }

    async purge() {
        (await this._forage.keys()).map(key => {
            this._forage.removeItem(key);
        });
    }

    // private extractId(key: string): string | null {
    //     const match = key.match(ID_REGEX);
    //
    //     if (!match) return null;
    //
    //     const [, id] = match;
    //     return id;
    // }
}