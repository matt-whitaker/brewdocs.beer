import {Phase} from "@/model/batch";
import {AddFn, MoveFn, RemoveFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import {saveSession, useSession} from "@/state/session";
import PlanningPhasesRow from "@/screen/planning/phases-row";
import PlanningPhasesAddRow from "@/screen/planning/phases-add-row";

const SESSION_KEY = "planning.phases";

export type PlanningPhasesProps = {
    phases: Phase[];
    add: AddFn;
    remove: RemoveFn;
    move: MoveFn;
}
export default function PlanningPhases({ phases, add, remove, move }: PlanningPhasesProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const existingNames = useMemo(() => phases.map(({ name }) => name), [phases]);

    const phaseRows = useMemo(() => phases.map((phase: Phase, i) => (
        <PlanningPhasesRow
            key={phase.name}
            row={i}
            phase={phase}
            // the schedule screen reads batch.phases[0] unconditionally, so the last phase can't go
            removable={phases.length > 1}
            first={i === 0}
            last={i === phases.length - 1}
            remove={remove}
            move={move} />
    )), [phases, remove, move]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Phases
            </DataGridHeaderRow>
            {phaseRows}
            <PlanningPhasesAddRow add={add} existingNames={existingNames} />
        </DataGrid>
    )
}
