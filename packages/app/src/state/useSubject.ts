import {useEffect, useState} from "react";

export type SubjectShape<T> = {
    subscribe(fn: (value:T) => void): void;
    initialize(): void;
}

export default function useSubject<T, TT>(subject: SubjectShape<T>, defaultValue?: infer TT): T|TT {
    const [state, setState] = useState<T|TT>(defaultValue);

    useEffect(() => {
        subject.subscribe((newState) => setState(newState));
        subject.initialize();
    }, [])

    return state;
}