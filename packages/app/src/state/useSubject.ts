import {useEffect, useState} from "react";

export type SubjectShape<T> = {
    subscribe(fn: (value:T) => void): void;
    initialize(): void;
}

export default function useSubject<T>(subject: SubjectShape<T|null>, defaultValue: T|null = null): T|null {
    const [state, setState] = useState<T|null>(defaultValue);

    useEffect(() => {
        subject.subscribe((newState) => setState(newState));
        subject.initialize();
    }, [subject])

    return state;
}