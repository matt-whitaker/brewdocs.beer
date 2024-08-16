import {useEffect, useState} from "react";

export type ServiceFn<T> = () => Promise<T>;

/**
 * Easy abstraction around basic service adapter pattern for React. Good for prototyping
 * @param service
 * @param defaultState
 */
export function useService<T>(service: ServiceFn<T>, defaultState: T): [T, object] {
    const [state, setState] = useState(defaultState);

    useEffect(() => {
        service().then(data => setState(data))
    }, [service]);

    return [state, service];
}