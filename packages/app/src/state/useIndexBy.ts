import {useMemo} from "react";
import {Entity} from "@brewdocs.beer/core";

export default function useIndexBy<T extends Entity, K extends keyof T = keyof T>(
    collection: T[],
    by: K extends keyof T ? (T[K] extends string ? K : never) : never = "id" as any
): Map<string, T> {
    return useMemo(() => {
        return (collection ?? []).reduce((m: Map<string, T>, r: T) => m.set(r[by] as string, r), new Map());
    }, [collection, by]);
}