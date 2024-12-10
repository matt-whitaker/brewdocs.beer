import {useEffect, useState} from "react";
import CollectionState from "@/state/collectionState";
import {Entity} from "@brewdocs.beer/core";

export type FilterFn<T> = (item: T) => boolean

export default function useCollectionState<T extends Entity>(
    observableState: CollectionState<T>,
    defaultState: T[]|null = null,
    filter?: FilterFn<T>
) {
    const [state, setState] = useState<T[]|null>(observableState.current ?? defaultState);

    useEffect(() => {
        const subscription = observableState.subscribe((newState) =>
            (filter && newState)
                ? setState(newState.filter(filter))
                : setState(newState as T[]));
        observableState.load();

        return () => subscription.unsubscribe();
    }, [observableState]);

    return state as T[];
}