import {cloneDeep, debounce, set} from "lodash";
import {useCallback, useEffect, useState} from "react";

export type UpdateFn = (dot: string, value: string) => void;
export default function useDataGrid<T>(data: T|null, onChange: (data: T) => void): [T|null, UpdateFn] {
    const [state, setState] = useState<T|null>(data);
    const debouncedOnChange = debounce(onChange, 350);

    useEffect(() => setState(data), [data]);
    const update: UpdateFn = useCallback((dot: string, value: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, value)
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state]);

    return [ state, update ];
}