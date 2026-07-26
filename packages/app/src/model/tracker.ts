import {Scalar} from "@brewdocs.beer/core";

/** which stage of a phase a milestone falls at */
type PhaseEvent = "pre" | "during" | "post";
/** what kind of milestone this is — only a gravity reading exists for now */
type MilestoneKind = "gravity";

/**
 * What a tracker entry is keyed against — a batch brewable's assignment/equipment
 * id (see `ensureBrewableIds`, `model/brewable.ts`) or a phase milestone. A
 * discriminated union so `key` can switch on `on` without a cast.
 */
export type Ref =
    | { on: "assignment"; id: string }
    | { on: "equipment"; id: string }
    | { on: "milestone"; phaseId: string; when: PhaseEvent; kind: MilestoneKind };

/** brew-day overlay state for one `Ref` — every field optional, so an entry only carries what's actually been recorded */
export type TrackerEntry = {
    completed?: boolean;
    actual?: Scalar;
    reading?: Scalar;
    date?: string;
};

/** the stable `batch.tracker` key for a `Ref` — stringified so it can address a plain object without a `useJsonEdit` dot-path (see `actions/tracker.ts`) */
export const key = (ref: Ref): string => {
    switch (ref.on) {
        case "assignment":
            return `assignment:${ref.id}`;
        case "equipment":
            return `equipment:${ref.id}`;
        case "milestone":
            return `milestone:${ref.phaseId}:${ref.when}:${ref.kind}`;
    }
};
