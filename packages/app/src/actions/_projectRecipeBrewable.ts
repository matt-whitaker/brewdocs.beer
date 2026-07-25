import {UNITS} from "@brewdocs.beer/core";
import Boil from "@/model/boil";
import {Assignment, BrewablePhase, HOP_PHASE_TO_PHASE_TYPE, PhaseType} from "@/model/brewable";
import Equipment from "@/model/equipment";
import Hop from "@/model/hop";
import {Mash} from "@/model/mash";
import Recipe from "@/model/recipe";

/** phaseType to fall back to for a hop whose `phase` no longer maps to its assignment's phaseType */
const PHASE_TYPE_TO_DEFAULT_HOP_PHASE: Partial<Record<PhaseType, Hop["phase"]>> = {
    boil: "boil",
    ferment: "secondary",
};

/** reverse of HOP_PHASE_TO_PHASE_TYPE: keeps the existing value when it already agrees (dry vs secondary survives), only overrides when the assignment moved the hop to a phaseType `phase` no longer implies */
function projectHopPhase(hop: Hop, phaseType: PhaseType): Hop["phase"] {
    if (HOP_PHASE_TO_PHASE_TYPE[hop.phase] === phaseType) return hop.phase;
    return PHASE_TYPE_TO_DEFAULT_HOP_PHASE[phaseType] ?? hop.phase;
}

const defaultMashStep = (i: number): Mash => ({
    name: `Mash Step ${i + 1}`,
    temp: {value: `0${UNITS.FAHRENHEIT}`, unit: UNITS.FAHRENHEIT},
    time: {value: `0${UNITS.MINUTES}`, unit: UNITS.MINUTES},
    grains: "all"
});

const defaultBoilStep = (i: number): Boil => ({
    name: `Boil Step ${i + 1}`,
    time: {value: `0${UNITS.MINUTES}`, unit: UNITS.MINUTES},
    hops: "all"
});

/**
 * A BrewablePhase carries equipment, not steps — mash/boil step content
 * (name/temp/time) has no Brewable equivalent, so this only syncs step
 * *count* to the matching phase count: existing steps are kept by index
 * (preserving whatever the user entered), extra phases get a freeform
 * default step, and steps beyond the phase count are dropped.
 */
function projectSteps<T>(phases: BrewablePhase[], type: PhaseType, previous: T[], makeDefault: (i: number) => T): T[] {
    const count = phases.filter(phase => phase.type === type).length;
    return Array.from({length: count}, (_, i) => previous[i] ?? makeDefault(i));
}

/** equipment is per-phase on the brewable but a single flat list on the legacy model; a name can appear in more than one phase (its `use` tags span them), so flattening dedupes by name */
function projectEquipment(phases: BrewablePhase[]): Equipment[] {
    const byName = new Map<string, Equipment>();
    for (const phase of phases) {
        for (const item of phase.equipment) {
            if (!byName.has(item.name)) byName.set(item.name, item);
        }
    }
    return [...byName.values()];
}

function byResourceType<T extends Assignment["resourceType"]>(assignments: Assignment[], resourceType: T) {
    return assignments.filter(
        (assignment): assignment is Extract<Assignment, {resourceType: T}> => assignment.resourceType === resourceType
    );
}

/**
 * Rebuilds a recipe's legacy grains/hops/yeasts/additives/mash/boil/equipment
 * arrays from its brewable, so RecipeOverview and createBatch — which still
 * read the legacy arrays — keep working while editing moves onto the
 * brewable. Mirrors _updateRecipe's Object.assign shape.
 */
export default function _projectRecipeBrewable(recipe: Recipe): Recipe {
    const {assignments, schedule: {phases}} = recipe.brewable;

    return Object.assign(recipe, {
        grains: byResourceType(assignments, "grain").map(assignment => assignment.resource),
        hops: byResourceType(assignments, "hop").map(assignment => ({
            ...assignment.resource,
            phase: projectHopPhase(assignment.resource, assignment.phaseType)
        })),
        yeasts: byResourceType(assignments, "yeast").map(assignment => assignment.resource),
        additives: byResourceType(assignments, "additive").map(assignment => assignment.resource),
        mash: projectSteps(phases, "mash", recipe.mash, defaultMashStep),
        boil: projectSteps(phases, "boil", recipe.boil, defaultBoilStep),
        equipment: projectEquipment(phases)
    });
}
