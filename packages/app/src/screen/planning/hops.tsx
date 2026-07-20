import DataGrid from "@/component/data-grid";
import Hop from "@/model/hop";
import {useCallback, useMemo} from "react";
import {useKbHops} from "@/state/kbHops";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import PlanningHopsRow from "@/screen/planning/hops-row";
import PlanningHopsAddRow from "@/screen/planning/hops-add-row";

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

    const toggleHops = useCallback((open: boolean) => saveSession(`planning.hops`, open), []);

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
        <>
            <Collapse
                toggle={toggleHops}
                key={"hops"}
                title={"Hops"}
                className="lg:collapse-open"
                openInitial={session?.[`planning.hops`] as boolean ?? true}>
                <DataGrid>
                    {hopRows}
                    <PlanningHopsAddRow add={add} kbHops={kbHops} kbHopsIndex={kbHopsIndex} />
                </DataGrid>
            </Collapse>
        </>
    );
}
