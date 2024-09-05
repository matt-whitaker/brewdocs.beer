import {BehaviorSubject} from "rxjs";

export default abstract class State<T> {
    protected _subject: BehaviorSubject<T|null>;

    constructor(initialValue: T) {
        this._subject = new BehaviorSubject<T|null>(initialValue);
    }

    subscribe(fn: (value: T|null) => void) {
        this._subject.subscribe(fn);
    }

    get current() {
        return this._subject.value;
    }
}