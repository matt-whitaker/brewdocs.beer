import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import DataGrid from "@/component/data-grid";
import {useCallback, useMemo} from "react";
import {useKbGrains} from "@/state/kbGrains";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import PlanningGrainsRow from "@/screen/planning/grains-row";
import PlanningGrainsAddRow from "@/screen/planning/grains-add-row";

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

    const toggleGrains = useCallback((open: boolean) => saveSession(`planning.grains`, open), [])

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
        <>
            <Collapse
                toggle={toggleGrains}
                key={"grains"}
                title={"Grains"}
                className="lg:collapse-open"
                openInitial={session?.[`planning.grains`] as boolean ?? true}>
                <DataGrid>
                    {grainRows}
                    <PlanningGrainsAddRow add={add} kbGrains={kbGrains} kbGrainsIndex={kbGrainsIndex} />
                </DataGrid>
            </Collapse>
        </>
    )
}
