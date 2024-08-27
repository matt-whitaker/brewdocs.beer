import {useCallback, useEffect, useMemo, useState} from "react";
import {cloneDeep, debounce, get, set} from "lodash";

//

export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: string) => void;
export type RemoveFn = (dot: string, index: number) => void;
export default function useButtonChecklist<T extends object>(
    data: T,
    onChange: (data: T) => void
): [T|null, ToggleFn, AddFn, RemoveFn] {
    const [state, setState] = useState<T|null>(data);
    useEffect(() => setState(data), [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    const toggle = useCallback((dot: string) => {
        const newState = set<T>(cloneDeep<T>(state), dot, !get(state, dot))
        setState(newState);
        debouncedOnChange(newState);
    }, [state, debouncedOnChange])

    const add = useCallback((dot: string, value: string) => {
        const newState = cloneDeep(state)
        get(newState, dot).push({ checked: false, name: value });
        setState(newState);
        debouncedOnChange(newState);
    }, [state, debouncedOnChange]);

    const remove = useCallback((dot: string, index: number) => {
        const newState = cloneDeep(state);
        get(newState, dot).splice(index, 1);
        setState(newState);
        debouncedOnChange(newState);
    }, [state, debouncedOnChange])

    return [state, toggle, add, remove];
}