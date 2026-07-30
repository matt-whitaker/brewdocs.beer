import {Scalar} from "@brewdocs.beer/core";

export type Ref =
    | { on: "assignment"; id: string }
    | { on: "equipment"; id: string }
    | { on: "milestone"; phaseId: string; id: string };

export type TrackerEntry = {
    completed?: boolean;
    actual?: Scalar;
    reading?: Scalar;
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
