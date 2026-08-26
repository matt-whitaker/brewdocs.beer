/**
 * A column of `DataGridRow`'s six-column grid. `colStart` and `cols` are both
 * expressed in these, and a `colStart` is the **real** grid column — column 4
 * is column 4, not "the 4th value column".
 */
export type GridColumn = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Narrow a computed column to a `GridColumn`, clamping to the grid.
 *
 * For positions derived at runtime (a `.map()` laying out a variable set of
 * value cells) — a literal type can't be inferred there, and the alternative
 * is a cast, which is what let an out-of-range column reach the DOM as a
 * missing class in the first place.
 */
export function gridColumn(n: number): GridColumn {
    return Math.min(6, Math.max(1, Math.round(n))) as GridColumn;
}

/**
 * Column spans a row child can claim, indexed by `cols - 1`. Written out in
 * full because tailwind only generates classes it can see literally — a
 * `col-span-${n}` template would compile to nothing.
 */
export const COL_SPANS = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6"];

/**
 * Column-start positions, indexed by `colStart - 1` (same literal-class reason
 * as COL_SPANS). Covers all six columns: a partial list is what made an
 * out-of-range `colStart` resolve to `undefined` and drop the class silently.
 */
export const COL_STARTS = ["col-start-1", "col-start-2", "col-start-3", "col-start-4", "col-start-5", "col-start-6"];

/**
 * The `lg:` halves of the two lists above, for a child placed differently on
 * mobile: the mobile value renders unprefixed and the desktop value from here,
 * matching the family's mobile-first convention (`ROW_ICON_BUTTON`'s
 * `top-1 lg:top-2`, the label's `leading-6 lg:leading-8`). Written out in full
 * for the same literal-class reason — a `lg:col-span-${n}` compiles to nothing.
 */
export const LG_COL_SPANS = ["lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5", "lg:col-span-6"];
export const LG_COL_STARTS = ["lg:col-start-1", "lg:col-start-2", "lg:col-start-3", "lg:col-start-4", "lg:col-start-5", "lg:col-start-6"];

/**
 * Shared by DataGridHeaderRow's collapse toggle and DataGridRow's expand toggle
 * so both chevrons sit in one vertical track — size them here, not at the call
 * sites, or the two drift apart. btn-square takes width *and* height from
 * btn-xs's --size, which is what keeps the box square.
 *
 * The hover and press states come from btn-ghost, so anything rendering this
 * without them (the header, whose whole row is the control) suppresses them
 * with pointer-events-none rather than by dropping the classes — the geometry
 * has to stay identical.
 */
export const CHEVRON = "btn btn-xs btn-ghost btn-square shrink-0";
export const CHEVRON_ICON = "w-4 transition-transform";

export const ROW_ICON_BUTTON = "btn btn-xs btn-ghost p-0 m-0 absolute left-1.5 top-1 lg:top-2";
