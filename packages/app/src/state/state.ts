import {BehaviorSubject} from "rxjs";

export default abstract class State<T> {
    protected _subject: BehaviorSubject<T|null>;

    constructor() {
        this._subject = new BehaviorSubject<T|null>(null);
    }

    subscribe(fn: (value: T|null) => void) {
        this._subject.subscribe(fn);
    }

    current() {
        return this._subject.value;
    }
}