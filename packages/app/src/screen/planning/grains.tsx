import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import {useKbGrains} from "@/state/kbGrains";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import PlanningGrainsRow from "@/screen/planning/grains-row";
import PlanningGrainsAddRow from "@/screen/planning/grains-add-row";

const SESSION_KEY = "planning.grains";

export type PlanningGrainsProps = {
    grains: Grain[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function PlanningGrains({ grains, add, remove, update, updateScalar }: PlanningGrainsProps) {
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
            <PlanningGrainsAddRow add={add} kbGrains={kbGrains} kbGrainsIndex={kbGrainsIndex} />
        </DataGrid>
    )
}
