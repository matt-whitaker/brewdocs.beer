import {createContext, useContext, useEffect, useId, useMemo} from "react";

/** A crumb's link target. `to` is a router route literal; params fill its `$` slots. */
export type CrumbLink = {
    to: string;
    params?: Record<string, string>;
};

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
    /**
     * Stable identity (hook name + args). A dynamic crumb hosts a data hook, so
     * Breadcrumbs keys each `<li>` by this: reusing one fiber across two crumbs
     * whose hooks differ in count throws "rendered more hooks than during the
     * previous render" (e.g. navigating a 1-hook recipe crumb → a 2-hook batch
     * crumb at the same list index).
     */
    key: string;
    to?: string;
    params?: Record<string, string>;
    /**
     * Derives the link from the loaded data, for a crumb whose *target* — not just
     * its label — depends on what was loaded. Use it when the route isn't knowable
     * up front: a batch's recipe lives at `/kb/recipe/$recipeId` or
     * `/recipe/$recipeId` depending on the batch's `recipeSource`, which is only
     * readable after the batch loads. Return `undefined` to render an unlinked
     * crumb. Takes precedence over the static `to`/`params`.
     */
    link?: (data: unknown) => CrumbLink | undefined;
};

/**
 * Build a dynamic crumb: pass the data **hook by reference** plus its args (not a
 * `() => useX()` thunk, which rules-of-hooks would flag) and a `transform` checked
 * against the hook's return. Stored as `unknown` — a generic would collapse in a
 * Crumb[] and reject the transform — bridged by the safe casts here.
 */
export function dynamicCrumb<A extends unknown[], T>(
    hook: (...args: A) => T,
    args: A,
    transform: (data: T) => string,
    rest?: {
        to?: string;
        params?: Record<string, string>;
        link?: (data: T) => CrumbLink | undefined;
    }
): DynamicCrumb {
    return {
        load: () => hook(...args),
        transform: transform as (data: unknown) => string,
        key: `${hook.name}:${JSON.stringify(args)}`,
        ...rest,
        link: rest?.link as ((data: unknown) => CrumbLink | undefined) | undefined,
    };
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
