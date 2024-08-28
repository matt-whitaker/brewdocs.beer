import {useCallback, useEffect, useState} from "react";
import {cloneDeep} from "lodash";

export type SubjectShape<T> = {
    current(): T;
    subscribe(fn: (value:T) => void): void;
    update(value: T): void;
    load(parm1?: string, parm2?: string): void;
}

export type ModifierFn<T> = (state: T|null) => void;
export type ModifyFn<T> = (fn: ModifierFn<T>) => void;

export default function useSubject<T>(subject: SubjectShape<T|null>, defaultValue: T|null = null, ...parms: [any?, any?]): [T|null, ModifyFn<T>] {
    const [state, setState] = useState<T|null>(subject.current() || defaultValue);

    useEffect(() => {
        subject.subscribe((newState) => setState(newState));
        subject.load(parms[0], parms[1]);
    }, [subject]);

    const modify = useCallback((fn: ModifierFn<T>) => {
        const newState = cloneDeep(state);
        fn(newState);
        subject.update(newState);
    }, [state, subject]);

    return [state, modify];
}