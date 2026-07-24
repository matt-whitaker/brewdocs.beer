import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import useIndexBy from "@/hooks/useIndexBy";
import useJsonEdit from "@/hooks/useJsonEdit";
import {PhaseType} from "@/model/brewable";
import Recipe from "@/model/recipe";
import RecipeEditAssignmentAddRow from "@/screen/recipe-edit-ingredients/assignment-add-row";
import RecipeEditPhaseSection, {AssignmentWithIndex} from "@/screen/recipe-edit-ingredients/phase-section";
import {useKbGrains} from "@/state/kbGrains";
import {useKbHops} from "@/state/kbHops";
import {useKbYeasts} from "@/state/kbYeasts";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type RecipeEditIngredientsProps = {
    recipeId: string;
};
export default function RecipeEditIngredients({ recipeId }: RecipeEditIngredientsProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, updateScalar, , add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    const kbGrains = useKbGrains();
    const kbGrainsIndex = useIndexBy(kbGrains, "name");
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    // the grouping order — distinct phase types, in the order they first
    // appear in the schedule (an assignment only carries a `phaseType`, not a
    // specific phase instance, so repeated phases of one type collapse together)
    const phaseTypes = useMemo(() => {
        const seen = new Set<PhaseType>();
        const ordered: PhaseType[] = [];
        for (const phase of data.brewable.schedule.phases) {
            if (!seen.has(phase.type)) {
                seen.add(phase.type);
                ordered.push(phase.type);
            }
        }
        return ordered;
    }, [data.brewable.schedule.phases]);

    const assignmentsByPhase = useMemo(() => {
        const withIndex: AssignmentWithIndex[] = data.brewable.assignments.map((assignment, index) => ({ assignment, index }));
        return new Map(phaseTypes.map(phaseType => [
            phaseType,
            withIndex.filter(({ assignment }) => assignment.phaseType === phaseType),
        ]));
    }, [data.brewable.assignments, phaseTypes]);

    return (
        <>
            {phaseTypes.map(phaseType => (
                <RecipeEditPhaseSection
                    key={phaseType}
                    phaseType={phaseType}
                    assignments={assignmentsByPhase.get(phaseType) ?? []}
                    remove={remove}
                    update={update}
                    updateScalar={updateScalar}
                />
            ))}
            <DataGrid>
                <RecipeEditAssignmentAddRow
                    add={add}
                    kbGrains={kbGrains}
                    kbGrainsIndex={kbGrainsIndex}
                    kbHops={kbHops}
                    kbHopsIndex={kbHopsIndex}
                    kbYeasts={kbYeasts}
                    kbYeastsIndex={kbYeastsIndex}
                />
            </DataGrid>
        </>
    );
}