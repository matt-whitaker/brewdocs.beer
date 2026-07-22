import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Hop from "@/model/hop";
import BatchPlanningHopsAddRow from "@/screen/batch-planning/hops-add-row";
import PlanningHopsRow from "@/screen/batch-planning/hops-row";
import {useKbHops} from "@/state/kbHops";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "planning.hops";

export type BatchPlanningHopsProps = {
    hops: Hop[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function BatchPlanningHops({ hops, add, remove, update, updateScalar }: BatchPlanningHopsProps) {
    const session = useSession();
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const hopRows = useMemo(() => hops.map((hop: Hop, i) => (
        <PlanningHopsRow
            key={`hop-${hop.name}-${i}`}
            row={i}
            hop={hop}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbHops={kbHops}
            kbHopsIndex={kbHopsIndex} />
    )), [hops, remove, update, updateScalar, kbHops, kbHopsIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Hops
            </DataGridHeaderRow>
            {hopRows}
            <BatchPlanningHopsAddRow add={add} kbHops={kbHops} kbHopsIndex={kbHopsIndex} />
        </DataGrid>
    );
}
