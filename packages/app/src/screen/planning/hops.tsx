import {KbHop} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import Hop from "@/model/hop";
import {Fragment, useCallback, useMemo} from "react";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {useKbHops} from "@/state/kbHops";
import DataGridInput from "@/component/data-grid/input";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {kbHopToHop} from "@/transform/kbHopToHop";
import PlanningHopsRow from "@/screen/planning/hops-row";

export type PlanningHopsProps = {
    hops: Hop[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function PlanningHops({ hops, add, remove, update, updateScalar }: PlanningHopsProps) {
    const session = useSession();
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");

    const addHop = useCallback((value: string) => add("hops", kbHopToHop(kbHopsIndex!.get(value)!)), [add, kbHopsIndex]);

    const hopRows = useMemo(() => hops.map((hop: Hop, i) => (
        <PlanningHopsRow
            row={i}
            hop={hop}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbHops={kbHops}
            kbHopsIndex={kbHopsIndex} />
    )), [hops, remove, update, updateScalar, kbHops, kbHopsIndex]);

    return (
        <>
            <Collapse
                toggle={(open: boolean) => saveSession(`planning.hops`, open)}
                key={"hops"}
                title={"Hops"}
                className="lg:collapse-open"
                openInitial={session?.[`planning.hops`] ?? true}>
                <DataGrid>
                    {hopRows}
                    <AddRow<KbHop>
                        data={kbHops}
                        add={addHop}
                    />
                </DataGrid>
            </Collapse>
        </>
    );
}