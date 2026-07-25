import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, MoveFn, RemoveFn} from "@/hooks/useJsonEdit";
import Brewable, {canRemovePhase, phaseLabel, Schedule} from "@/model/brewable";
import RecipeEditPhasesAddRow from "@/screen/brewable-edit/phases/phases-add-row";
import RecipeEditPhasesRow from "@/screen/brewable-edit/phases/phases-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipeEdit.phases";

export type BrewableEditPhasesProps = {
    brewable: Brewable;
    add: AddFn;
    remove: RemoveFn;
    move: MoveFn;
};

// A brewable panel: lists the schedule's phases as entries — nothing more than
// add a phase, remove one, and reorder them. Equipment lives on its own panel.
// Dot-paths are relative to the brewable.
export default function BrewableEditPhases({ brewable, add, remove, move }: BrewableEditPhasesProps) {
    const session = useSession();
    const phases = brewable.schedule.phases;
    const schedule: Schedule = useMemo(() => ({ phases }), [phases]);

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => phases.map((phase, i) => (
        <RecipeEditPhasesRow
            key={`phase-${i}-${phase.type}`}
            row={i}
            label={phaseLabel(phases, i)}
            removable={canRemovePhase(schedule, i)}
            count={phases.length}
            remove={remove}
            move={move} />
    )), [phases, schedule, remove, move]);

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
