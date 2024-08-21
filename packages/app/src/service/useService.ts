import {useCallback, useEffect, useMemo, useState} from "react";

export type Service<T> = {
    get: (id: string) => Promise<T>
    list: () => Promise<T[]>
}

export default function useService<T>(service: Service<T>) {
    return useMemo(() => ({
        get (
            id: string,
            defaultState?: T|void|null
        ): T|null {
            const [state, setState] = useState<T>(defaultState || null);
            const _service = useCallback(service.get, [service, id]);

            useEffect(() => {
                _service(id).then(data => setState(data));
            }, [_service, id]);

            return state;
        },
        list (defaultState?: T[]): T[] {
            const [state, setState] = useState<T[]>(defaultState ?? []);
            const _service = useCallback(service.list, [service]);

            useEffect(() => {
                _service().then(data => setState(data));
            }, [_service]);

            return state;
        }
    }), [service])
}