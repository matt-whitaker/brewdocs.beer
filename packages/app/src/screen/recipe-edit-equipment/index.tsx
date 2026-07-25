import {useCallback} from "react";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import useJsonEdit from "@/hooks/useJsonEdit";
import {phaseLabel} from "@/model/brewable";
import Recipe from "@/model/recipe";
import RecipeEditEquipmentPhaseSection from "@/screen/recipe-edit-equipment/equipment-phase-section";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type RecipeEditEquipmentProps = {
    recipeId: string;
};

// Organized like the Ingredients panel, but grouped by phase *instance*
// (equipment is stored per phase at brewable.schedule.phases[i].equipment, not
// as a flat phaseType-tagged list). One collapsible section per phase, each
// with its equipment plus a per-phase add-row.
export default function RecipeEditEquipment({ recipeId }: RecipeEditEquipmentProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, , , add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    const equipmentIndex = useIndexBy(equipmentCatalog, "name");
    const phases = data.brewable.schedule.phases;

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
