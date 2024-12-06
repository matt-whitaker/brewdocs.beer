import {BehaviorSubject} from "rxjs";


export default abstract class State<T> {
    protected _subject: BehaviorSubject<T|null>;

    constructor(initialValue: T|null) {
        this._subject = new BehaviorSubject<T|null>(initialValue);
    }

    subscribe(fn: (value: T|null) => void) {
        return this._subject.subscribe(fn);
    }

    get current(): T|null {
        return this._subject.value;
    }

    abstract load(): void;
}