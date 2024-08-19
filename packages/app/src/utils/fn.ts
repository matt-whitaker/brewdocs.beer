import {ChangeEventHandler} from "react";

export type EventFn<T> = (value: T) => void;
export type ServiceFn<T, P> = (...parms: P) => Promise<T|null>;

export const eventValue = (fn: EventFn<infer T>) => ({ target: { value } }: ChangeEventHandler) => fn(value);

