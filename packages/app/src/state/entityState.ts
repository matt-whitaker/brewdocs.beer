import {BehaviorSubject} from "rxjs";
import {Entity} from "@brewdocs.beer/core";


export default abstract class EntityState<T extends Entity> {
    protected _subject: BehaviorSubject<T|null>;

    constructor(initialValue: T|null = null) {
        this._subject = new BehaviorSubject<T|null>(initialValue);
    }

    subscribe(fn: (value: T|null) => void) {
        return this._subject.subscribe(fn);
    }

    get current(): T|null {
        return this._subject.value;
    }

    abstract load(id: string): void;
}