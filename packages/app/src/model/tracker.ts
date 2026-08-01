import {Scalar} from "@brewdocs.beer/core";
import Additive from "@/model/additive";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";

/**
 * What a tracker entry is attached to. Every kind is `{on, id}` because they all
 * point at a **stable per-instance uuid** — an assignment, a phase's equipment
 * item, a phase's milestone, or the phase itself. None needs its parent phase in
 * the key: the uuid is unique on its own, and encoding a *relationship* inside an
 * *identity* would orphan the entry if the item ever moved between phases.
 *
 * (The milestone ref used to carry a `phaseId`, back when a milestone had no id
 * of its own and was identified by phase + a fixed `when`/`kind` pair. Once
 * milestones became user-added entries with uuids, that field stopped doing any
 * work — this is the shape equipment always had.)
 */
export type Ref =
    | { on: "assignment"; id: string }
    | { on: "equipment"; id: string }
    | { on: "milestone"; id: string }
    | { on: "phase"; id: string };

/**
 * The as-brewed counterpart of an assignment's `resource`, keyed by the **same
 * field names as the plan**: a hop records `weight`/`boil`, a grain `weight`, a
 * yeast `temp`. Every field is optional — only what actually differed is stored.
 *
 * Deriving this from the resource models, rather than listing bespoke slots, is
 * the point: adding a field to `Hop` makes it recordable here for free, a hop can
 * never carry a yeast's `temp`, and a row can record *any number* of differing
 * values instead of the two a fixed `actual`/`actualDetail` pair allowed. `name`
 * is excluded — it identifies the resource, it isn't something you observe.
 */
export type ResourceActuals = Partial<Omit<Grain & Hop & Yeast & Additive, "name">>;

/** the `ResourceActuals` fields holding a `Scalar` — the ones a schedule column can edit (`starter` is a boolean) */
export type ResourceScalarField = Exclude<keyof ResourceActuals, "starter">;

export type WaterParameter = "ph" | "calcium" | "magnesium" | "sodium" | "sulfate" | "chloride" | "bicarbonate";

export type WaterReadings = Partial<Record<WaterParameter, Scalar>>;

export type TrackerEntry = {
    completed?: boolean;
    /**
     * Universal — when this happened or was measured (a yeast's pitch date, a
     * gravity reading's date). Any ref kind may carry one.
     */
    date?: string;
    /** assignment — as-brewed values, mirroring the plan's own resource shape */
    resource?: ResourceActuals;
    /** milestone — the gravity value read (a milestone has no resource to mirror) */
    reading?: Scalar;
    water?: WaterReadings;
};

export const key = (ref: Ref): string => {
    switch (ref.on) {
        case "assignment":
            return `assignment:${ref.id}`;
        case "equipment":
            return `equipment:${ref.id}`;
        case "milestone":
            return `milestone:${ref.id}`;
        case "phase":
            return `phase:${ref.id}`;
    }
};
