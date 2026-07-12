import {KbYeast} from "@brewdocs.beer/kb";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import DataGrid from "@/component/data-grid";
import {Fragment, useCallback, useMemo} from "react";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {useKbYeasts} from "@/state/kbYeasts";
import DataGridInput from "@/component/data-grid/input";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {kbYeastToYeast} from "@/transform/kbYeastToYeast";
import PlanningYeastsRow from "@/screen/planning/yeasts-row";

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
    const addYeast = useCallback((value: string) => add("yeasts", kbYeastToYeast(kbYeastsIndex!.get(value)!)), [add, kbYeastsIndex])

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
                openInitial={session?.[`planning.yeast`] ?? true}>
                <DataGrid>
                    {yeastRows}
                    <AddRow<KbYeast>
                        data={kbYeasts}
                        add={addYeast}
                    />
                </DataGrid>
            </Collapse>
        </>
    )
}