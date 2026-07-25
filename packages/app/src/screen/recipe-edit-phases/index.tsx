import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import useJsonEdit from "@/hooks/useJsonEdit";
import {canRemovePhase, phaseLabel, Schedule} from "@/model/brewable";
import Recipe from "@/model/recipe";
import RecipeEditPhasesAddRow from "@/screen/recipe-edit-phases/phases-add-row";
import RecipeEditPhasesRow from "@/screen/recipe-edit-phases/phases-row";
import {saveRecipe, useRecipe} from "@/state/recipes";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipeEdit.phases";

export type RecipeEditPhasesProps = { recipeId: string };

// The Phases panel lists the schedule's phases as entries: add a phase, remove
// one, reorder them, and edit each phase's equipment in a nested grid.
export default function RecipeEditPhases({ recipeId }: RecipeEditPhasesProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, , , add, remove, move] = useJsonEdit<Recipe>(recipe, onChange);

    const session = useSession();
    const phases = data.brewable.schedule.phases;
    const schedule: Schedule = useMemo(() => ({ phases }), [phases]);

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => phases.map((phase, i) => (
        <RecipeEditPhasesRow
            key={`phase-${i}-${phase.type}`}
            row={i}
            phase={phase}
            label={phaseLabel(phases, i)}
            removable={canRemovePhase(schedule, i)}
            count={phases.length}
            add={add}
            remove={remove}
            update={update}
            move={move} />
    )), [phases, schedule, add, remove, update, move]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Phases
            </DataGridHeaderRow>
            {rows}
            <RecipeEditPhasesAddRow add={add} />
        </DataGrid>
    );
}
