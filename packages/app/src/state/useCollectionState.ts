import {useEffect, useState} from "react";
import CollectionState from "@/state/collectionState";
import {Entity} from "@/model/type";

export default function useCollectionState<T extends Entity>(
    observableState: CollectionState<T>,
    defaultState: T[]|null = null,
) {
    const [state, setState] = useState<T[]|null>(observableState.current ?? defaultState);

    useEffect(() => {
        const subscription = observableState.subscribe((newState) => setState(newState as T[]));
        observableState.load();

        return () => subscription.unsubscribe();
    }, [observableState]);

    return state as T[];
}