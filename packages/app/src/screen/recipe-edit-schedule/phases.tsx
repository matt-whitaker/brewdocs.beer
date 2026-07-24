import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase, canRemovePhase, phaseLabel, Schedule} from "@/model/brewable";
import RecipeEditPhasesAddRow from "@/screen/recipe-edit-schedule/phases-add-row";
import RecipeEditPhasesRow from "@/screen/recipe-edit-schedule/phases-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipeEdit.phases";

export type RecipeEditPhasesProps = {
    phases: BrewablePhase[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
};
export default function RecipeEditPhases({ phases, add, remove, update }: RecipeEditPhasesProps) {
    const session = useSession();
    const schedule: Schedule = useMemo(() => ({ phases }), [phases]);

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => phases.map((phase, i) => (
        <RecipeEditPhasesRow
            key={`phase-${i}-${phase.type}`}
            row={i}
            phase={phase}
            label={phaseLabel(phases, i)}
            removable={canRemovePhase(schedule, i)}
            add={add}
            remove={remove}
            update={update} />
    )), [phases, schedule, add, remove, update]);

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
