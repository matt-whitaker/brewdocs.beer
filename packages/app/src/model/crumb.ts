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

