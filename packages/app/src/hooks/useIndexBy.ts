import {useMemo} from "react";
import {Entity} from "@brewdocs.beer/core";

export default function useIndexBy<T extends Entity, K extends keyof T = keyof T>(
    collection: T[],
    by: K = ("id" as K)
): Map<string, T> {
    return useMemo(() => {
        return (collection ?? []).reduce((m: Map<string, T>, r: T) => m.set(r[by] as string, r), new Map());
    }, [collection, by]);
}