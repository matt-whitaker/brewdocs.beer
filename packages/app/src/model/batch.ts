import {Entity, Scalar} from "@brewdocs.beer/core";
import Brewable from "@/model/brewable";
import Measurements from "@/model/measurements";
import {RecipeSource} from "@/model/recipe";
import Statuses from "@/model/statuses";
import {TrackerEntry} from "@/model/tracker";

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
/** what the item is — the shopping vocabulary plus readings */
export type ScheduleKind = "grains"|"hops"|"yeasts"|"additives";
/** either facet; a Phase filters on these without caring which kind it is */
export type ScheduleTag = SchedulePhase|ScheduleKind;

/**
 * A configurable slice of the schedule — one tab on the BatchSchedule screen.
 *
 * `tags` is an intersection: an item belongs to the phase when it carries *every*
 * listed tag. So `["boil"]` is the whole boil, while `["boil","hops"]` narrows to
 * just the hop additions in it. An empty list matches everything.
 *
 * Config only — the phase's equipment kit is derived live from
 * `batch.brewable.schedule.phases` (matched by type) and its checkoff lives in
 * `batch.tracker`, not here (see _BatchSchedule_ in CLAUDE.md).
 */
export interface Phase {
    /** identity — React key, tab title, query-param and session-key value; stays stable across reorders */
    name: string;
    tags: ScheduleTag[];
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
    /** derived — secondary fields, revealed only when the row is expanded */
    extra?: ScheduleDetail[];
    /** user-owned — preserved across recalculation */
    completed: boolean;
}

/** display label for a phase — the "1.", "2." prefix is derived from position, never stored */
export const phaseLabel = (phase: Phase, index: number): string => `${index + 1}. ${phase.name}`;

/** current shape of the Batch model — bump when a stored batch would no longer parse/derive correctly */
export const BATCH_MODEL_VERSION = 2;

export default interface Batch extends Entity {
    /** schema version the batch was created under; see BATCH_MODEL_VERSION */
    version: number;
    name: string;
    brewDate: string;
    /** when the yeast went in — fermentation's start, edited from the Ferment phase */
    pitchedDate: string;
    recipeId: string;
    /** which store recipeId points at — absent on batches created before this field, which were all catalog recipes (treat as "kb") */
    recipeSource?: RecipeSource;
    status: Statuses;

    /**
     * The batch's source-of-truth brewable — cloned from the recipe (user source)
     * or narrowed via kbBrewableToBrewable (kb source) at creation time. Shopping,
     * schedule, summary, and the Schedule screen's equipment checklist all derive
     * from it live, and batch-planning edits it (see _Derived batch data_ in
     * CLAUDE.md).
     */
    brewable: Brewable;

    brewer?: string;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;


    actuals: Measurements;
    shopping: ShoppingItem[];
    schedule: ScheduleItem[];
    /** configuration — how the derived schedule is sliced into tabs */
    phases: Phase[];

    /**
     * Batch-local brew-day overlay state (checkoffs, actuals, gravity readings,
     * yeast pitch), keyed by `key(ref)` (`model/tracker.ts`) — a `Ref` points at
     * a brewable assignment/equipment id or a phase milestone. Write through
     * `actions/tracker.ts`'s `putEntry`/`pruneTracker`, never a `useJsonEdit`
     * dot-path — a key like `equipment:<uuid>` has colons `utils/func.ts`'s
     * `get`/`setIn` won't cleanly address.
     */
    tracker: Record<string, TrackerEntry>;

    notes?: string;
}
