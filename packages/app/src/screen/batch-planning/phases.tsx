import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, MoveFn, RemoveFn} from "@/hooks/useJsonEdit";
import {Phase} from "@/model/batch";
import BatchPlanningPhasesAddRow from "@/screen/batch-planning/phases-add-row";
import PlanningPhasesRow from "@/screen/batch-planning/phases-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "planning.phases";

export type BatchPlanningPhasesProps = {
    phases: Phase[];
    add: AddFn;
    remove: RemoveFn;
    move: MoveFn;
};
export default function BatchPlanningPhases({ phases, add, remove, move }: BatchPlanningPhasesProps) {
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
            <BatchPlanningPhasesAddRow add={add} existingNames={existingNames} />
        </DataGrid>
    );
}
