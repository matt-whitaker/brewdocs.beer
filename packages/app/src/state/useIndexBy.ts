import {useMemo} from "react";
import {Entity} from "@brewdocs.beer/core";

export default function useIndexBy<T extends Entity>(collection: T[], by: keyof T = "id"): Map<string, T> {
    return useMemo(() => {
        return (collection ?? []).reduce((m: Map<string, T>, r: T) => m.set(r[by], r), new Map());
    }, [collection, by]);
}