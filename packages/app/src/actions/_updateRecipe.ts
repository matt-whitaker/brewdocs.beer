import {KbRecipe} from "@brewdocs.beer/kb";
import Batch, {Phase, SchedulePhase} from "@/model/batch";
import Brewable, {Assignment, ResourceType} from "@/model/brewable";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";

const SCHEDULE_PHASES: SchedulePhase[] = ["mash", "boil", "ferment"];

/** narrows an Assignment's `resource` by `resourceType`, matching the discriminated union */
function resourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T) {
    return assignments
        .filter((assignment): assignment is Extract<Assignment, { resourceType: T }> => assignment.resourceType === resourceType)
        .map(assignment => assignment.resource);
}

/** the SchedulePhase a legacy Phase maps to, read off its own tags rather than its (renamable) name */
const phaseTypeOf = (phase: Phase): SchedulePhase | undefined =>
    phase.tags.find((tag): tag is SchedulePhase => (SCHEDULE_PHASES as string[]).includes(tag));

/** replaces each legacy phase's equipment with the matching brewable phase(s)' kit */
function phasesFromBrewable(phases: Phase[], brewable: Brewable): Phase[] {
    return phases.map(phase => {
        const type = phaseTypeOf(phase);
        if (!type) return phase;

        return {
            ...phase,
            equipment: brewable.schedule.phases
                .filter(brewablePhase => brewablePhase.type === type)
                .flatMap(brewablePhase => brewablePhase.equipment)
                .map(item => equipmentToScheduleItem(item, type))
        };
    });
}

/**
 * Projects `brewable` (already built by createBatch — a clone for a user
 * recipe, kbBrewableToBrewable's output for a kb one) onto the legacy fields
 * the existing batch screens read. mash/boil are step lists with no Brewable
 * equivalent and still come straight from the recipe.
 */
export default function _updateRecipe(recipe: KbRecipe, brewable: Brewable, batch: Partial<Batch>) {
    return Object.assign(batch, {
        grains: resourcesOf(brewable.assignments, "grain"),
        hops: resourcesOf(brewable.assignments, "hop"),
        yeasts: resourcesOf(brewable.assignments, "yeast"),
        additives: resourcesOf(brewable.assignments, "additive"),
        mash: kbRecipeMashToMash(recipe.mash),
        boil: kbRecipeBoilToBoil(recipe.boil),
        phases: phasesFromBrewable(batch.phases ?? [], brewable),
    });
}
