/**
 * Column spans a row child can claim, indexed by `cols - 1`. Written out in
 * full because tailwind only generates classes it can see literally — a
 * `col-span-${n}` template would compile to nothing.
 */
export const COL_SPANS = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6"];

/** Column-start positions for a value cell, indexed by `colStart - 1` (same literal-class reason as COL_SPANS). */
export const VALUE_COL_STARTS = ["col-start-4", "col-start-5", "col-start-6"];

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
