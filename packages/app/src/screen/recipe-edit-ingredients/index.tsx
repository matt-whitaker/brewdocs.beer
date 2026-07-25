import {useCallback, useMemo} from "react";
import useIndexBy from "@/hooks/useIndexBy";
import useJsonEdit from "@/hooks/useJsonEdit";
import {PhaseType} from "@/model/brewable";
import Recipe from "@/model/recipe";
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

    // a phase's add-row offers every catalog resource in one dropdown; the value
    // carries the resource type (`"<type>:<name>"`) so the row can build the
    // right assignment without a second dropdown. Additives have no catalog and
    // aren't offered here.
    const resourceOptions = useMemo(() => [
        ...kbGrains.map(({ name }) => ({ value: `grain:${name}`, name })),
        ...kbHops.map(({ name }) => ({ value: `hop:${name}`, name })),
        ...kbYeasts.map(({ name }) => ({ value: `yeast:${name}`, name })),
    ], [kbGrains, kbHops, kbYeasts]);

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
            {phaseTypes.map((phaseType, i) => (
                <RecipeEditPhaseSection
                    key={phaseType}
                    position={i + 1}
                    phaseType={phaseType}
                    assignments={assignmentsByPhase.get(phaseType) ?? []}
                    add={add}
                    remove={remove}
                    update={update}
                    updateScalar={updateScalar}
                    resourceOptions={resourceOptions}
                    kbGrainsIndex={kbGrainsIndex}
                    kbHopsIndex={kbHopsIndex}
                    kbYeastsIndex={kbYeastsIndex}
                />
            ))}
        </>
    );
}
