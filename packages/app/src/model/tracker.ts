import {Scalar} from "@brewdocs.beer/core";

export type Ref =
    | { on: "assignment"; id: string }
    | { on: "equipment"; id: string }
    | { on: "milestone"; phaseId: string; id: string };

export type TrackerEntry = {
    completed?: boolean;
    /** what actually went in — the amount, against the plan's `ScheduleItem.amount` */
    actual?: Scalar;
    /**
     * how it actually went in — a hop/additive's boil time, a yeast's pitch
     * temperature — against the plan's `ScheduleItem.detail`. Named for the row's
     * secondary column; unrelated to `ScheduleDetail` (the expander fields).
     */
    actualDetail?: Scalar;
    /** milestone — the gravity value read */
    reading?: Scalar;
    /** (yeast) assignment — pitch date | milestone — reading-taken date */
    date?: string;
};

export const key = (ref: Ref): string => {
    switch (ref.on) {
        case "assignment":
            return `assignment:${ref.id}`;
        case "equipment":
            return `equipment:${ref.id}`;
        case "milestone":
            return `milestone:${ref.phaseId}:${ref.id}`;
    }
};
