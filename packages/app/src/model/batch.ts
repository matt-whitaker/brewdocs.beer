import {Entity, Scalar} from "@brewdocs.beer/core";
import Brewable from "@/model/brewable";
import Measurements from "@/model/measurements";
import {RecipeSource} from "@/model/recipe";
import Statuses from "@/model/statuses";
import {TrackerEntry} from "@/model/tracker";

export type ShoppingTag = "hops"|"grains"|"yeasts"|"additives";

export interface ShoppingItem {
    name: string;
    tags: ShoppingTag[];
    scalar?: Scalar;
    cost: Scalar;
    purchased: boolean;
}

/** the grouping a schedule row falls under within its phase */
export type ScheduleKind = "grains"|"hops"|"yeasts"|"additives";

export interface ScheduleDetail {
    name: string;
    input?: "date";
}

export interface ScheduleItem {
    id: string;
    name: string;
    /** the `BrewablePhase.id` this row belongs to — taken from its source assignment, so repeats of a phase type stay distinct */
    phaseId: string;
    kind: ScheduleKind;
    note?: string;
    /** planned amount — a grain/hop weight */
    amount?: Scalar;
    /** planned secondary value — a hop/additive's boil time, a yeast's pitch temp */
    detail?: Scalar;
    extra?: ScheduleDetail[];
}

export default interface Batch extends Entity {
    name: string;
    brewDate: string;
    recipeId: string;
    recipeSource?: RecipeSource;
    status: Statuses;
    brewable: Brewable;
    brewer?: string;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;
    actuals: Measurements;
    shopping: ShoppingItem[];
    tracker: Record<string, TrackerEntry>;

    notes?: string;
}
