import {ChangeEventHandler} from "react";


export const eventValue = (fn: <T>(value: T) => void) => ({ target: { value } }: ChangeEventHandler) => fn(value);