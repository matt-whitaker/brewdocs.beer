import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import Brewable, {phaseLabel} from "@/model/brewable";
import RecipeEditEquipmentPhaseSection from "@/screen/brewable-edit/equipment/equipment-phase-section";

export type BrewableEditEquipmentProps = {
    brewable: Brewable;
    update: UpdateFn;
    add: AddFn;
    remove: RemoveFn;
};

// A brewable panel organized like Ingredients, but grouped by phase *instance*
// (equipment is stored per phase at schedule.phases[i].equipment, not as a flat
// flat list). One collapsible section per phase instance, each with its
// equipment plus a per-phase add-row. Dot-paths are relative to the brewable.
export default function BrewableEditEquipment({ brewable, update, add, remove }: BrewableEditEquipmentProps) {
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");
    const phases = brewable.schedule.phases;

    return (
        <>
            {phases.map((phase, i) => (
                <RecipeEditEquipmentPhaseSection
                    key={`equipment-phase-${i}-${phase.type}`}
                    phase={i}
                    label={phaseLabel(phases, i)}
                    items={phase.equipment}
                    add={add}
                    remove={remove}
                    update={update}
                    catalog={equipmentCatalog}
                    catalogIndex={equipmentIndex}
                />
            ))}
        </>
    );
}
