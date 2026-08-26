// Field-by-field reference for these types: ../MODELS.md — update it when a field changes.
import {Scalar} from "@brewdocs.beer/core";

/** primitives-only supertype of app `BrewablePhase` — `type` stays a loose string here, narrowed to `PhaseType` in the app */
export interface KbBrewablePhase {
    type: string;
    equipment: {
        name: string;
        notes?: string;
    }[];
}

export interface KbSchedule {
    phases: KbBrewablePhase[];
}

/**
 * primitives-only supertype of app `Assignment` — `phaseType`/`resourceType` stay loose strings
 * (narrowed to `PhaseType`/`ResourceType` in the app), and `resource` is a plain union rather than
 * a discriminated one so it stays assignable from the app's narrower discriminated-union `Assignment`
 */
export interface KbAssignment {
    /**
     * ⚠️ Two ways to say which phase, because this type is the supertype of both
     * the authored data *and* the app's `Assignment` (`Recipe extends KbRecipe`).
     * Authored kb JSON carries `phaseType` (a loose "mash"/"boil"/"ferment" string —
     * hand-written data shouldn't contain uuids); the app narrows that to a
     * `phaseId` referencing a specific `BrewablePhase` instance in
     * `kbBrewableToBrewable`. Exactly one is present in practice.
     */
    phaseType?: string;
    /** set on app-side brewables only — see `phaseType` above */
    phaseId?: string;
    /** identifies the resource within its catalog/collection */
    slug: string;
    resourceType: string;
    /**
     * loose kb-side resource an assignment carries — mirrors the app's
     * Grain/Hop/Yeast/Additive (primitives only), a plain union narrowed per
     * `resourceType` in the app. Standalone shapes since #196 dropped the
     * `KbRecipe.{grains,hops,…}` arrays this used to index into.
     */
    resource:
        | { name: string; weight: Scalar }
        | { name: string; weight: Scalar; alpha: Scalar; boil: Scalar; phase?: string }
        | { name: string; avg_attn: Scalar; temp: Scalar; starter: boolean }
        | { name: string; boil?: Scalar; weight?: Scalar };
}

/** primitives-only supertype of app `Brewable` — see model/brewable.ts there */
export interface KbBrewable {
    schedule: KbSchedule;
    assignments: KbAssignment[];
}
