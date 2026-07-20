import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import {useKbYeasts} from "@/state/kbYeasts";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import PlanningYeastsRow from "@/screen/planning/yeasts-row";
import PlanningYeastsAddRow from "@/screen/planning/yeasts-add-row";

const SESSION_KEY = "planning.yeasts";

export type PlanningYeastsProps = {
    yeasts: Yeast[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function PlanningYeasts({ yeasts, add, remove, update, updateScalar }: PlanningYeastsProps) {
    const session = useSession();
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const yeastRows = useMemo(() => yeasts.map((yeast: Yeast, i) => (
        <PlanningYeastsRow
            key={`yeast-${yeast.name}-${i}`}
            row={i}
            yeast={yeast}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbYeasts={kbYeasts}
            kbYeastsIndex={kbYeastsIndex} />
    )), [yeasts, remove, update, updateScalar, kbYeasts, kbYeastsIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                label="Yeast"
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Yeast
            </DataGridHeaderRow>
            {yeastRows}
            <PlanningYeastsAddRow add={add} kbYeasts={kbYeasts} kbYeastsIndex={kbYeastsIndex} />
        </DataGrid>
    )
}
