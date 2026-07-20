import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import DataGrid from "@/component/data-grid";
import {useCallback, useMemo} from "react";
import {useKbYeasts} from "@/state/kbYeasts";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import PlanningYeastsRow from "@/screen/planning/yeasts-row";
import PlanningYeastsAddRow from "@/screen/planning/yeasts-add-row";

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

    const toggleYeasts = useCallback((open: boolean) => saveSession(`planning.yeasts`, open), []);

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
        <>
            <Collapse
                toggle={toggleYeasts}
                key={"yeast"}
                title={"Yeast"}
                className="lg:collapse-open"
                openInitial={session?.[`planning.yeast`] as boolean ?? true}>
                <DataGrid>
                    {yeastRows}
                    <PlanningYeastsAddRow add={add} kbYeasts={kbYeasts} kbYeastsIndex={kbYeastsIndex} />
                </DataGrid>
            </Collapse>
        </>
    )
}
