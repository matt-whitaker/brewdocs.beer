import {useEffect, useState} from "react";

export type ServiceGetFn<T> = (id: string) => Promise<T|null>;
export type ServiceListFn<T> = () => Promise<T[]>;
export type Service<T> = {
    get: ServiceGetFn<T>;
    list: ServiceListFn<T>
}

export type ServiceFn<T> = ServiceGetFn<T> | ServiceListFn<T>;

export default function useService<T>(serviceFn: ServiceFn<T>, defaultState: T, [parm1, parm2]: [any?, any?]): T {
    const [state, setState] = useState<T>(defaultState);
    useEffect(() => {
        // @ts-ignore
        serviceFn(parm1, parm2).then(data => setState(data));
    }, [serviceFn, parm1, parm2]);

    return state;
}

