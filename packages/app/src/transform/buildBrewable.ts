import {KbRecipe} from "@brewdocs.beer/kb";
import Brewable, {Assignment, defaultBrewable, PhaseType} from "@/model/brewable";
import Equipment, {EquipmentUses} from "@/model/equipment";
import Hop from "@/model/hop";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {intersection} from "@/utils/func";

/**
 * Legacy ingredient/equipment arrays a Brewable is derived from — the shape
 * `Recipe` and `KbRecipe` share. mash/boil are steps with no Brewable
 * equivalent (a BrewablePhase carries equipment, not steps) and go unused
 * here; they're kept in the shape since both source types carry them.
 */
export type BuildBrewableSource = Pick<KbRecipe, "grains" | "hops" | "yeasts" | "additives" | "mash" | "boil" | "equipment">;

/** hop.phase -> the Brewable phase it's assigned to */
const HOP_PHASE_TO_PHASE_TYPE: Record<Hop["phase"], PhaseType> = {
    boil: "boil",
    secondary: "ferment",
    dry: "ferment",
};

/** equipment `use` tags routed to each phase, mirroring defaultBatch.ts's `forUse` */
const PHASE_EQUIPMENT_USES: Record<PhaseType, EquipmentUses[]> = {
    mash: ["mash", "clean", "measure"],
    boil: ["boil", "measure", "transfer"],
    ferment: ["starter", "primary", "secondary"],
};

const equipmentForPhase = (equipment: BuildBrewableSource["equipment"], phaseType: PhaseType): Equipment[] => equipment
    .filter(({use}) => intersection(PHASE_EQUIPMENT_USES[phaseType], use as EquipmentUses[]).length > 0)
    .map(({name, use, count}) => ({name, use: use as EquipmentUses[], count}));

/**
 * Derives a populated Brewable (schedule + assignments) from a recipe's or
 * kb-recipe's legacy arrays. Pure — never mutates or saves `source`.
 */
export function buildBrewable(source: BuildBrewableSource): Brewable {
    const hops = kbRecipeHopsToHops(source.hops);

    const assignments: Assignment[] = [
        ...source.grains.map((grain): Assignment => ({
            phaseType: "mash",
            slug: grain.name,
            resourceType: "grain",
            resource: grain,
        })),
        ...hops.map((hop): Assignment => ({
            phaseType: HOP_PHASE_TO_PHASE_TYPE[hop.phase],
            slug: hop.name,
            resourceType: "hop",
            resource: hop,
        })),
        ...source.yeasts.map((yeast): Assignment => ({
            phaseType: "ferment",
            slug: yeast.name,
            resourceType: "yeast",
            resource: yeast,
        })),
        ...source.additives.map((additive): Assignment => ({
            phaseType: "boil",
            slug: additive.name,
            resourceType: "additive",
            resource: additive,
        })),
    ];

    const brewable = defaultBrewable();
    brewable.assignments = assignments;
    brewable.schedule.phases = brewable.schedule.phases.map(phase => ({
        ...phase,
        equipment: equipmentForPhase(source.equipment, phase.type),
    }));

    return brewable;
}
