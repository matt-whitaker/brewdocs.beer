import {useCallback, useEffect, useMemo, useState} from "react";
import {cloneDeep, debounce, get, set} from "lodash";

//

export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: string) => void;
export default function useButtonChecklist<T>(
    data: T,
    onChange: (data: T) => void
): [T|null, ToggleFn, AddFn] {
    const [state, setState] = useState<T|null>(data);
    useEffect(() => setState(data), [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    const toggle = useCallback((dot: string) => {
        const newState = set(cloneDeep(data), dot, !get(data, dot))
        setState(newState);
        debouncedOnChange(newState);
    }, [data, debouncedOnChange])

    const add = useCallback((dot: string, value: string) => {
        const newState = cloneDeep(data)
        get(newState, dot).push({ checked: false, name: value });
        setState(newState);
        debouncedOnChange(newState);
    }, [data, debouncedOnChange])

    return [state, toggle, add];
}