import {Assignment, BrewablePhase} from "@/model/brewable";
import Equipment from "@/model/equipment";
import Recipe from "@/model/recipe";

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

export function byResourceType<T extends Assignment["resourceType"]>(assignments: Assignment[], resourceType: T) {
    return assignments.filter(
        (assignment): assignment is Extract<Assignment, {resourceType: T}> => assignment.resourceType === resourceType
    );
}

/**
 * Rebuilds a recipe's legacy grains/hops/yeasts/additives/equipment arrays
 * from its brewable, so createBatch — which still reads the legacy arrays —
 * keeps working while editing moves onto the brewable. Mirrors _updateRecipe's
 * Object.assign shape.
 */
export default function _projectRecipeBrewable(recipe: Recipe): Recipe {
    const {assignments, schedule: {phases}} = recipe.brewable;

    return Object.assign(recipe, {
        grains: byResourceType(assignments, "grain").map(assignment => assignment.resource),
        hops: byResourceType(assignments, "hop").map(assignment => assignment.resource),
        yeasts: byResourceType(assignments, "yeast").map(assignment => assignment.resource),
        additives: byResourceType(assignments, "additive").map(assignment => assignment.resource),
        equipment: projectEquipment(phases)
    });
}
