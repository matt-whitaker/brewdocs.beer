import {ChangeEvent} from "react";

export type EventFn<T> = (value: T) => void;
type Event<T> = ChangeEvent & {
    target: {
        value: T
    }
}

export const eventValue = <T>(fn: EventFn<T>) => ({ target: { value } }: Event<T>) => fn(value);

