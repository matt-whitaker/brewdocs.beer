import Measurements from "@/model/measurements";
import Hydrometer from "@/model/hydrometer";
import {Entity} from "@brewdocs.beer/core";
import {Mash} from "@/model/mash";
import Boil from "@/model/boil";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Additive from "@/model/additive";
import Scalar from "@/model/scalar";
import Statuses from "@/model/statuses";

/** what an item was derived from; replaces the old shopping "groups" */
export type ShoppingTag = "hops"|"grains"|"yeasts"|"additives";

export interface ShoppingItem {
    name: string;
    /** derived — the first tag is the source ingredient type */
    tags: ShoppingTag[];
    /** derived — aggregate weight, absent for ingredients that aren't weighed */
    scalar?: Scalar;
    /** user-owned — preserved across recalculation */
    cost: Scalar;
    /** user-owned — preserved across recalculation */
    purchased: boolean;
}

/** the brew-day stage a schedule item happens in */
export type SchedulePhase = "mash"|"boil"|"ferment";
/** what the item is — the shopping vocabulary plus readings and equipment, which aren't ingredients */
export type ScheduleKind = "grains"|"hops"|"yeasts"|"additives"|"gravity"|"equipment";
/** either facet; a Phase filters on these without caring which kind it is */
export type ScheduleTag = SchedulePhase|ScheduleKind;

/**
 * A configurable slice of the schedule — one tab on the Schedule screen.
 *
 * `tags` is an intersection: an item belongs to the phase when it carries *every*
 * listed tag. So `["boil"]` is the whole boil, while `["boil","hops"]` narrows to
 * just the hop additions in it. An empty list matches everything.
 */
export interface Phase {
    /** identity — React key, tab title, query-param and session-key value; stays stable across reorders */
    name: string;
    tags: ScheduleTag[];
    /**
     * The kit to have ready before this phase starts, checked off in place — so
     * it's config *and* state on the same object. That's fine here: phases already
     * live per-batch, so there's nothing shared to contaminate.
     *
     * These are `ScheduleItem`s tagged `[phase, "equipment"]` rather than derived
     * `_updateSchedule` output — equipment stays user-managed (added/removed from
     * Planning) and lives here, not in `batch.schedule`. `path` is unused (there's
     * no ingredient value to point at) and left `""`.
     */
    equipment: ScheduleItem[];
}

/**
 * A secondary field tucked under a schedule row in its own nested DataGrid —
 * the same "extra config" pattern the planning rows use for hop alpha.
 *
 * It points into the batch the way a ScheduleItem does, but carries no state of
 * its own: no checkoff, no planned-vs-actual. It's a field, not a step.
 */
export interface ScheduleDetail {
    name: string;
    /** dot-path to the value, e.g. `pitchedDate` */
    path: string;
    /** a date is a plain string at the path and skips unit formatting */
    input?: "date";
    readonly?: boolean;
}

export interface ScheduleItem {
    name: string;
    /** derived — [phase, kind]; two facets is what lets the screen group either way */
    tags: [SchedulePhase, ScheduleKind];
    /** derived — parenthetical detail after the name, e.g. a hop's alpha */
    note?: string;
    /**
     * derived — the *planned* amount, refreshed from the ingredient on every
     * recalculation. Absent for steps that aren't measured out (yeast, readings).
     */
    amount?: Scalar;
    /**
     * user-owned — what actually went in, when it differed from the plan.
     *
     * Deliberately not a write-through to `grains[i].weight`: that figure is what
     * the shopping list aggregates, and using 1.2oz on brew day shouldn't rewrite
     * what you were told to buy. Unset means "went to plan".
     */
    actual?: Scalar;
    /**
     * derived — dot-path to the value this row shows, e.g. `hops[2].boil`.
     *
     * Unlike a ShoppingItem's cost, the values a schedule row edits (a hop's boil
     * time, a pitch temperature) belong to the *ingredient*. The item points at
     * them rather than copying them, so there's no second copy to diverge or to
     * be clobbered on the next recalculation.
     */
    path: string;
    /** derived — the value at `path` is owned by a shared step (a mash temp), so it's read-only here */
    readonly?: boolean;
    /** derived — secondary fields, revealed only when the row is expanded */
    extra?: ScheduleDetail[];
    /** user-owned — preserved across recalculation */
    completed: boolean;
}

/** display label for a phase — the "1.", "2." prefix is derived from position, never stored */
export const phaseLabel = (phase: Phase, index: number): string => `${index + 1}. ${phase.name}`;

/** current shape of the Batch model — bump when a stored batch would no longer parse/derive correctly */
export const BATCH_MODEL_VERSION = 1;

export default interface Batch extends Entity {
    /** schema version the batch was created under; see BATCH_MODEL_VERSION */
    version: number;
    name: string;
    brewDate: string;
    /** when the yeast went in — fermentation's start, edited from the Ferment phase */
    pitchedDate: string;
    recipeId: string;
    status: Statuses;

    brewer?: string;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeasts: Yeast[];
    additives: Additive[];
    //adjuncts

    actuals: Measurements;
    hydrometer: Hydrometer[];
    shopping: ShoppingItem[];
    schedule: ScheduleItem[];
    /** configuration — how the derived schedule is sliced into tabs */
    phases: Phase[];

    notes?: string;
}
