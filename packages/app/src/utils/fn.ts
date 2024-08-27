import {ChangeEvent} from "react";

export type UpdateFn = (dot: string, value: string) => void;
export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: string) => void;
export type RemoveFn = (dot: string, index: number) => void;

export type EventFn<T> = (value: T) => void;
type Event<T> = ChangeEvent & {
    target: {
        value: T
    }
}
export const eventValue = <T>(fn: EventFn<T>) => ({ target: { value } }: Event<T>) => fn(value);

