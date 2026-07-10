import {ScreenH4, ScreenH5} from "@brewdocs.beer/design";
import {Fragment} from "react";
import DataGrid from "@/component/data-grid";
import Grain from "@/model/grain";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {Mash} from "@/model/mash";
import Hydrometer from "@/model/hydrometer";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type ScheduleMashProps = {
    mash: Mash[];
    grains: Grain[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    hydro: Hydrometer;
    hydroIndex: number;
};

export default function ScheduleMash({ mash, grains, update, updateScalar, hydro, hydroIndex }: ScheduleMashProps) {
    const session = useSession();

    return (
        <>
            <Collapse
                toggle={(open: boolean) => saveSession(`schedule.mash`, open)}
                key={"mash"}
                title={"1. Mash"}
                className="lg:collapse-open"
                openInitial={session[`schedule.mash`] ?? true}>
                {mash.map((m, i) => (
                    <Fragment key={`mash-${m.name}-${i}`}>
                        <ScreenH4 className="cozy">{m.name} - {m.time.value}</ScreenH4>
                        <DataGrid>
                            {grains.map((grain: Grain, i) => (
                                <DataGridRow key={`grain-${grain.name}-${i}`}>
                                    <DataGridLabel>{grain.name} <DataGridLabelNote>({grain.weight.value})</DataGridLabelNote></DataGridLabel>
                                    <DataGridInput readonly value={m.temp.value} col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}
                <div className="divider my-0"></div>
                <ScreenH5 className="cozy">Gravity Reading</ScreenH5>
                <DataGrid>
                    <DataGridRow key={`hydro-${hydro.name}-${hydroIndex}`}>
                        <DataGridLabel>
                            <DataGridInput
                                col={1}
                                type="date"
                                value={hydro.date}
                                onChange={(value: string) => update(`hydrometer[${hydroIndex}].date`, value)}
                            />
                        </DataGridLabel>
                        <DataGridInput
                            col={3}
                            value={hydro.gravity.value}
                            onChange={(value: string) => update(`hydrometer[${hydroIndex}].gravity.value`, value)}
                            onBlur={(value: string) => updateScalar(`hydrometer[${hydroIndex}].gravity`, value)}
                        />
                    </DataGridRow>
                    {/*{data.hydrometer.map((hydro: Hydrometer, i) => (*/}
                    {/*    */}
                    {/*))}*/}
                </DataGrid>
            </Collapse>
        </>
    )
}