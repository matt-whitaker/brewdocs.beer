import {cloneDeep, debounce, get, set} from "lodash";
import {useCallback, useEffect, useMemo, useState} from "react";

type UpdateFn = (dot: string, value?: unknown) => void;
type ToggleFn = (dot: string) => void;

export default function useJsonEdit<T>(data: T, onChange: (data: T) => void): [T, UpdateFn, ToggleFn] {
    const [state, setState] = useState<T>(data);
    useEffect(() => setState(data), [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    /**
     * Updates a property on the JSON object
     */
    const update = useCallback((dot: string, value?: unknown) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, value)
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state, debouncedOnChange]);

    /**
     * Toggles a boolean property on the JSON object (ie false to true and vice versa)
     */
    const toggle = useCallback((dot: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, !get(state, dot))
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state, debouncedOnChange]);

    /**
     * Replaces
     */
    // const replace = useCallback(<T>(dot: string, value?: T) => {
    //     if (state) {
    //         const newState = set(cloneDeep(state), dot, value)
    //         setState(newState);
    //         debouncedOnChange(newState);
    //     }
    // }, [state, debouncedOnChange]);

    return [state, update, toggle];
}