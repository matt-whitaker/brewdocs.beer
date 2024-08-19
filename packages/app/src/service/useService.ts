import {useCallback, useEffect, useState} from "react";
import {ServiceFn} from "@/utils/fn";

/**
 * Easy abstraction around basic service adapter pattern for React. Good for prototyping
 * @param service
 * @param defaultState
 * @param parms
 */
export function useService<Fn extends ServiceFn<T, Parameters<Fn>>, T>(
    service: Fn,
    parms: Parameters<Fn> = [] as Parameters<Fn>,
    defaultState?: T|void
): T|void {
    const [state, setState] = useState<T>(defaultState);

    const _parms = (parms ?? []);
    const _service = useCallback(service, [service, ..._parms]);
    useEffect(() => { _service(..._parms).then(data => setState(data)); }, [_service, ..._parms]);

    return state;
}