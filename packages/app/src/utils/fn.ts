import {ChangeEvent} from "react";

export type EventFn<T> = (value: T) => void;
export type ServiceFn<T, P> = (...parms: P) => Promise<T|null>;

export const eventValue = (fn: EventFn<infer T>) => ({ target: { value } }: ChangeEvent) => fn(value);

