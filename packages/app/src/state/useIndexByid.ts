import {Entity} from "@/model/type";
import {useMemo} from "react";

export default function useIndexById<T extends Entity>(collection: T[]) {
    return useMemo(() => {
        return (collection ?? []).reduce((m: Map<string, T>, r: T) => m.set(r.id, r), new Map());
    }, [collection]);
}