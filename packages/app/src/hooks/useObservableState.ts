import {useEffect, useState} from "react";
import State from "@/state/state";

export default function useObservableState<T>(
    observableState: State<T>,
    defaultState: T|null = null,
) {
    const [state, setState] = useState<T|null>(observableState.current ?? defaultState);

    useEffect(() => {
        const subscription = observableState.subscribe((newState) => setState(newState as T));
        observableState.load();

        return () => subscription.unsubscribe();
    }, [observableState]);

    return state as T;
}