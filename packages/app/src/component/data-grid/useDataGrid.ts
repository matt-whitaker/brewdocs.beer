import {cloneDeep, set} from "lodash";
import {useCallback, useEffect, useState} from "react";

export type UpdateFn = (dot: string, value: string) => void;
export default function useDataGrid<T>(data: T|void): [T|void, UpdateFn] {
    const [state, setState] = useState<T>(data);
    useEffect(() => setState(data), [data]);

    const update: UpdateFn = useCallback((dot: string, value: string) => {
        if (state) {
            setState(set(cloneDeep(state), dot, value));
        }
    }, [state]);

    return [ state, update ];
}