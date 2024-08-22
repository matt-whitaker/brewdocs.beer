import {useCallback, useEffect, useMemo, useState} from "react";

export type Service<T> = {
    get: (id: string) => Promise<T>
    list: () => Promise<T[]>
}

export default function useService<T, M extends keyof Service<T>>(service: Service<T>[M], defaultState: T, params: any[]) {
    const [state, setState] = useState<T>(defaultState || null);
    useEffect(() => {
        service(...params).then(data => setState(data));
    }, [service, ...params]);

    return state;
}

