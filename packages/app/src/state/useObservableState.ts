import {useEffect, useState} from "react";
import State from "@/state/state";

export default function useObservableState<T, Null>(
    observableState: State<T, Null>,
    defaultState: Null,
) {
    const [state, setState] = useState<T|Null>(observableState.current ?? defaultState);

    useEffect(() => {
        const subscription = observableState.subscribe((newState) => setState(newState as T));
        observableState.load();

        return () => subscription.unsubscribe();
    }, [observableState]);

    return state as T;
}