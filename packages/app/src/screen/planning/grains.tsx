import {KbGrain} from "@brewdocs.beer/kb";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import DataGrid from "@/component/data-grid";
import {Fragment, useCallback, useMemo} from "react";
import {useKbGrains} from "@/state/kbGrains";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {kbGrainToGrain} from "@/transform/kbGrainToGrain";
import PlanningGrainsRow from "@/screen/planning/grains-row";

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
    const addGrain = useCallback((value: string) => {
        const newGrain = kbGrainToGrain(kbGrainsIndex.get(value)!);
        add("grains", newGrain);
    }, [add, kbGrainsIndex]);

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
                openInitial={session?.[`planning.grains`] ?? true}>
                <DataGrid>
                    {grainRows}
                    <AddRow<KbGrain>
                        data={kbGrains}
                        add={addGrain}
                    />
                </DataGrid>
            </Collapse>
        </>
    )
}