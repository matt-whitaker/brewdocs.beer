import {BehaviorSubject} from "rxjs";

export default abstract class State<T, Null> {
    protected _subject: BehaviorSubject<T|Null>;

    constructor(initialValue: T) {
        this._subject = new BehaviorSubject<T|Null>(initialValue);
    }

    subscribe(fn: (value: T|Null) => void) {
        this._subject.subscribe(fn);
    }

    get current() {
        return this._subject.value;
    }
}