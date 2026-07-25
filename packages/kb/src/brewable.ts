import {KbRecipe} from "./models";

/** primitives-only supertype of app `BrewablePhase` — `type` stays a loose string here, narrowed to `PhaseType` in the app */
export interface KbBrewablePhase {
    type: string;
    equipment: {
        name: string;
        use: string[];
        count?: number;
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
    phaseType: string;
    /** identifies the resource within its catalog/collection */
    slug: string;
    resourceType: string;
    resource:
        | KbRecipe["grains"][number]
        | KbRecipe["hops"][number]
        | KbRecipe["yeasts"][number]
        | KbRecipe["additives"][number];
}

/** primitives-only supertype of app `Brewable` — see model/brewable.ts there */
export interface KbBrewable {
    schedule: KbSchedule;
    assignments: KbAssignment[];
}
