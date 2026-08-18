import {createContext, ReactNode, useCallback, useContext, useEffect, useId, useMemo, useState} from "react";
import {Crumb} from "@/model/crumb";

type BreadcrumbContextValue = {
    register: (id: string, crumbs: Crumb[]) => void;
    unregister: (id: string) => void;
    groups: Map<string, Crumb[]>;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

function useBreadcrumbContext(): BreadcrumbContextValue {
    const ctx = useContext(BreadcrumbContext);
    if (!ctx) {
        throw new Error("Breadcrumb hooks must be used within a BreadcrumbProvider");
    }
    return ctx;
}

/**
 * Push a group of crumbs onto the stack while the caller is mounted. Pass a
 * *stable* array — a module const for a static trail, or `useMemo` keyed on the
 * route params for a dynamic one — since it drives an effect; a fresh array every
 * render would thrash.
 */
export function useBreadcrumbs(crumbs: Crumb[]): void {
    const id = useId();
    const { register, unregister } = useBreadcrumbContext();

    // keep the group's content current; updating an existing id keeps its slot
    useEffect(() => { register(id, crumbs); }, [id, register, crumbs]);
    // remove only on unmount, so a content update never moves the slot to the end
    useEffect(() => () => unregister(id), [id, unregister]);
}

/**
 * The assembled trail, parent → child. Groups register child-first (React effects
 * fire bottom-up), so reverse the group order; each group keeps its own order.
 */
export function useBreadcrumbTrail(): Crumb[] {
    const { groups } = useBreadcrumbContext();
    return useMemo(() => [...groups.values()].reverse().flat(), [groups]);
}

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    // a Map preserves insertion order, which is what the reverse in
    // useBreadcrumbTrail relies on
    const [groups, setGroups] = useState<Map<string, Crumb[]>>(() => new Map());

    const register = useCallback((id: string, crumbs: Crumb[]) => {
        // set on an existing id updates its value but keeps its slot
        setGroups((prev) => new Map(prev).set(id, crumbs));
    }, []);

    const unregister = useCallback((id: string) => {
        setGroups((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const value = useMemo(() => ({ register, unregister, groups }), [register, unregister, groups]);
    return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}
