import {useCallback, useEffect, useState} from "react";
import {cloneDeep} from "lodash";

export type SubjectShape<T> = {
    subscribe(fn: (value:T) => void): void;
    initialize(): void;
    update(value: T): void;
}

export type ModifierFn<T> = (state: T|null) => void;
export type ModifyFn<T> = (fn: ModifierFn<T>) => void;

export default function useSubject<T>(subject: SubjectShape<T|null>, defaultValue: T|null = null): [T|null, ModifyFn<T>] {
    const [state, setState] = useState<T|null>(defaultValue);

    useEffect(() => {
        subject.subscribe((newState) => setState(newState));
        subject.initialize();
    }, [subject]);

    const modify = useCallback((fn: ModifierFn<T>) => {
        const newState = cloneDeep(state);
        fn(newState);
        subject.update(newState);
    }, [state, subject]);

    return [state, modify];
}