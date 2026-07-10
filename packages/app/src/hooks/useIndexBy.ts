import {useMemo} from "react";

export default function useIndexBy<T extends object, K extends keyof T = keyof T>(
    collection?: T[]|T|null,
    by: K = ("id" as K)
): Map<string, T>|null {
    return useMemo(() => {
        if (!collection) {
            return null;
        }

        if (!(collection instanceof Array)) {
            return new Map([[collection[by], collection]]);
        }

        return (collection).reduce((m: Map<string, T>, r: T) => m.set(r[by] as string, r), new Map());
    }, [collection, by]);
}