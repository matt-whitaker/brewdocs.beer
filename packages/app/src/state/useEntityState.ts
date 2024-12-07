
import {useEffect, useState} from "react";
import EntityState from "@/state/entityState";
import {Entity} from "@brewdocs.beer/core";

export default function useEntityState<T extends Entity>(
    observableState: EntityState<T>,
    id: string|null = null,
    defaultState: T|null = null,
) {
    const [state, setState] = useState<T|null>(observableState.current ?? defaultState);

    useEffect(() => {
        if (id) {
            const subscription = observableState.subscribe((newState) => setState(newState as T));
            observableState.load(id);

            return () => subscription.unsubscribe();
        }
    }, [id, observableState]);

    return state as T;
}