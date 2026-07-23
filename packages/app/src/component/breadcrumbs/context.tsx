import {createContext, useContext, useEffect, useId, useMemo} from "react";

export type StaticCrumb = {
    label: string;
    to?: string;
    params?: Record<string, string>;
};

/**
 * A crumb whose label comes from loaded data. `load` runs a data hook inside the
 * Breadcrumbs render (within a Suspense boundary — never in the route, so the
 * route can't suspend); `transform` maps its data to the label. Build one with
 * `dynamicCrumb` rather than a literal.
 */
export type DynamicCrumb = {
    load: () => unknown;
    transform: (data: unknown) => string;
    to?: string;
    params?: Record<string, string>;
};

/**
 * Build a dynamic crumb: pass the data **hook by reference** plus its args (not a
 * `() => useX()` thunk, which rules-of-hooks would flag) and a `transform` checked
 * against the hook's return. Stored as `unknown` — a generic would collapse in a
 * Crumb[] and reject the transform — bridged by the one safe cast here.
 */
export function dynamicCrumb<A extends unknown[], T>(
    hook: (...args: A) => T,
    args: A,
    transform: (data: T) => string,
    rest?: { to?: string; params?: Record<string, string> }
): DynamicCrumb {
    return { load: () => hook(...args), transform: transform as (data: unknown) => string, ...rest };
}

export type Crumb = StaticCrumb | DynamicCrumb;

export const isDynamic = (crumb: Crumb): crumb is DynamicCrumb => "load" in crumb;

export type BreadcrumbContextValue = {
    register: (id: string, crumbs: Crumb[]) => void;
    unregister: (id: string) => void;
    groups: Map<string, Crumb[]>;
};

// the Provider lives in ./index alongside the Breadcrumbs component, so this file
// exports only hooks/helpers (keeps Fast Refresh happy)
export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

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
