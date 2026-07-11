import {KbGrain} from "@brewdocs.beer/kb";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import DataGrid from "@/component/data-grid";
import {Fragment} from "react";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {kbGrainToGrain, useKbGrains} from "@/state/kbGrains";
import DataGridInput from "@/component/data-grid/input";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";

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

    return (
        <>
            <Collapse
                toggle={(open: boolean) => saveSession(`planning.grains`, open)}
                key={"grains"}
                title={"Grains"}
                className="lg:collapse-open"
                openInitial={session?.[`planning.grains`] ?? true}>
                <DataGrid>
                    {grains.map((grain: Grain, i) => (
                        <Fragment key={`grain-${grain.name}-${i}`}>
                            <DataGridRow>
                                <DataGridLabel className="ml-6">
                                    <DataGridRemoveButton onClick={() => remove("grains", i)} />
                                    <DataGridSelect
                                        data={kbGrains.map((({ name }) => ({ value: name, name })))}
                                        value={grain.name}
                                        onChange={(value: string) => update(`grains[${i}]`, kbGrainToGrain(kbGrainsIndex!.get(value)!))}
                                    />
                                </DataGridLabel>
                                <DataGridInput
                                    col={3}
                                    value={grain.weight.value}
                                    onChange={(value: string) => update(`grains[${i}].weight.value`, value)}
                                    onBlur={(value: string) => updateScalar(`grains[${i}].weight`, value)}
                                />
                            </DataGridRow>
                        </Fragment>
                    ))}
                    <AddRow<KbGrain>
                        data={kbGrains}
                        add={(value: string) => add("grains", kbGrainToGrain(kbGrainsIndex!.get(value)!))}
                    />
                </DataGrid>
            </Collapse>
        </>
    )
}