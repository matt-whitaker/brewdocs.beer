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

export type SchedulePhase = "mash"|"boil"|"ferment";
export type ScheduleKind = "grains"|"hops"|"yeasts"|"additives";
export type ScheduleTag = SchedulePhase|ScheduleKind;

export interface Phase {
    name: string;
    tags: ScheduleTag[];
}

export interface ScheduleDetail {
    name: string;
    path?: string;
    input?: "date";
}

export interface ScheduleItem {
    id: string;
    name: string;
    tags: [SchedulePhase, ScheduleKind];
    note?: string;
    amount?: Scalar;
    path: string;
    extra?: ScheduleDetail[];
}

export const phaseLabel = (phase: Phase, index: number): string => `${index + 1}. ${phase.name}`;

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
    schedule: ScheduleItem[];
    phases: Phase[];
    tracker: Record<string, TrackerEntry>;

    notes?: string;
}
