import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import BatchPlanningGrainsAddRow from "@/screen/batch-planning/grains-add-row";
import PlanningGrainsRow from "@/screen/batch-planning/grains-row";
import {useKbGrains} from "@/state/kbGrains";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "planning.grains";

export type BatchPlanningGrainsProps = {
    grains: Grain[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function BatchPlanningGrains({ grains, add, remove, update, updateScalar }: BatchPlanningGrainsProps) {
    const session = useSession();
    const kbGrains = useKbGrains();
    const kbGrainsIndex = useIndexBy(kbGrains, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const grainRows = useMemo(() => grains.map((grain: Grain, i) => (
        <PlanningGrainsRow
            key={`grain-${grain.name}-${i}`}
            row={i}
            grain={grain}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbGrains={kbGrains}
            kbGrainsIndex={kbGrainsIndex} />
    )), [remove, update, updateScalar, kbGrains, kbGrainsIndex, grains]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Grains
            </DataGridHeaderRow>
            {grainRows}
            <BatchPlanningGrainsAddRow add={add} kbGrains={kbGrains} kbGrainsIndex={kbGrainsIndex} />
        </DataGrid>
    );
}
