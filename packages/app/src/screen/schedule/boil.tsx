import {Fragment} from "react";
import DataGrid from "@/component/data-grid";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import Hop from "@/model/hop";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import Additive from "@/model/additive";
import Boil from "@/model/boil";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type ScheduleBoilTypes = {
    boil: Boil[];
    hops: Hop[];
    additives: Additive[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function ScheduleBoil({ boil, hops, additives, update, updateScalar }: ScheduleBoilTypes) {
    return (
        <div className="pt-2">
            {boil.map((m, i) => (
                <Fragment key={`boil-${m.name}-${i}`}>
                    <DataGridSubheaderRow>{m.name}  - {m.time.value}</DataGridSubheaderRow>
                    <DataGrid>
                        {hops.map((hop: Hop, i) => (
                            <DataGridRow zebra key={`hop-${hop.name}-${i}`}>
                                <DataGridLabel>{hop.name} <DataGridLabelNote>({hop.alpha.value})</DataGridLabelNote></DataGridLabel>
                                <DataGridInput readonly value={hop.weight.value} col={2} />
                                <DataGridInput
                                    col={3}
                                    value={hop.boil.value}
                                    onChange={(value: string) => update(`hops[${i}].boil`, value)}
                                    onBlur={(value: string) => updateScalar(`hops[${i}].boil`, value)}
                                />
                            </DataGridRow>
                        ))}
                    </DataGrid>
                </Fragment>
            ))}
            {additives.length ? (
                <Fragment>
                    <DataGridSubheaderRow>Additives</DataGridSubheaderRow>
                    <DataGrid>
                        {additives.map((additive: Additive, i) => (
                            <DataGridRow zebra key={`additive-${additive.name}-${i}`}>
                                <DataGridLabel>{additive.name}</DataGridLabel>
                                <DataGridInput
                                    col={3}
                                    value={additive.boil.value}
                                    onChange={(value: string) => update(`additives[${i}].scalar`, value)}
                                    onBlur={(value: string) => updateScalar(`additives[${i}].scalar`, value)}
                                />
                            </DataGridRow>
                        ))}
                    </DataGrid>
                </Fragment>
            ) : <></>}
        </div>
    );
}
