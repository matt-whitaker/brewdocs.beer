import {useCallback, useEffect, useMemo, useState} from "react";
import {cloneDeep, debounce, get, set} from "lodash";

export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: string) => void;
export type RemoveFn = (dot: string, index: number) => void;

export default function useChecklist<T extends object>(
    data: T,
    onChange: (data: T) => void
): [T|null, ToggleFn, AddFn, RemoveFn] {
    const [state, setState] = useState<T|null>(data);
    useEffect(() => setState(data), [data]);

    const toggle = useCallback<ToggleFn>((dot: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, !get(state, dot))
            setState(newState);
            onChange(newState);
        }
    }, [state, onChange])

    const add = useCallback<AddFn>((dot: string, value: string) => {
        if (state) {
            const newState = cloneDeep(state)
            get(newState, dot).push({ checked: false, name: value });
            setState(newState);
            onChange(newState);
        }
    }, [state, onChange]);

    const remove = useCallback((dot: string, index: number) => {
        if (state) {
            const newState = cloneDeep(state);
            get(newState, dot).splice(index, 1);
            setState(newState);
            onChange(newState);
        }
    }, [state, onChange])

    return [state, toggle, add, remove];
}