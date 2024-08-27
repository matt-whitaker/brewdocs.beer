import {cloneDeep, debounce, get, set} from "lodash";
import {useCallback, useEffect, useMemo, useState} from "react";

export type UpdateFn = (dot: string, value: string) => void;
export type ToggleFn = (dot: string) => void;
export default function useDataGrid<T>(data: T, onChange: (data: T) => void): [T, UpdateFn, ToggleFn] {
    const [state, setState] = useState<T>(data);
    useEffect(() => setState(data), [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    const update: UpdateFn = useCallback((dot: string, value: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, value)
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state]);

    const toggle = useCallback((dot: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, !get(state, dot))
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state, debouncedOnChange])

    return [ state, update, toggle ];
}