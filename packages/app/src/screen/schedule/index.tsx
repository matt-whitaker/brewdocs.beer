"use client";

import {ScreenH1, ScreenH3, ScreenH4} from "@brewdocs.beer/design";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Batch from "@/model/batch";
import Grain from "@/model/grain";
import Hydrometer from "@/model/hydrometer";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import useJsonEdit from "@/hooks/useJsonEdit";
import {Fragment} from "react";
import Additive from "@/model/additive";
import ScreenTwoCol from "@/component/screen/two-col";
import DataGridLabelNote from "@/component/data-grid/label-note";
import ScheduleMash from "@/screen/schedule/mash";
import ScheduleBoil from "@/screen/schedule/boil";
import SchedulePitch from "@/screen/schedule/pitch";
import ScheduleChill from "@/screen/schedule/chill";

export type BrewDayProps = { batch: Batch, onChange: (batch: Batch) => void; };
export default function BrewDay({ batch, onChange }: BrewDayProps) {
    const [data, update, updateScalar] = useJsonEdit<Batch>(batch, onChange);

    return (
        <>
            <ScreenTwoCol>
                <ScreenH1 className="col-start-1 lg:col-span-2 col-span-1 mb-2">Brew Schedule</ScreenH1>
                <div>
                    <ScheduleMash
                        grains={data.grains}
                        mash={data.mash}
                        hydro={data.hydrometer[0]}
                        hydroIndex={0}
                        update={update}
                        updateScalar={updateScalar}
                    />
                    <ScheduleBoil
                        boil={data.boil}
                        hops={data.hops}
                        additives={data.additives}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </div>
                <div>
                    <ScheduleChill />
                    <SchedulePitch yeast={data.yeast} update={update} updateScalar={updateScalar} />
                </div>
            </ScreenTwoCol>
            {/*<ScreenTwoCol>*/}
            {/*    <ScreenH1 className="col-start-1 lg:col-span-2 col-span-1 mb-2">Measurements</ScreenH1>*/}
            {/*    <div>*/}
            {/*        <ScreenH3>Gravity Readings</ScreenH3>*/}
            {/*        <DataGrid>*/}
            {/*            {data.hydrometer.map((hydro: Hydrometer, i) => (*/}
            {/*                <DataGridRow key={`hydro-${hydro.name}-${i}`}>*/}
            {/*                    <DataGridLabel>*/}
            {/*                        <DataGridInput*/}
            {/*                            col={1}*/}
            {/*                            type="date"*/}
            {/*                            value={hydro.date}*/}
            {/*                            onChange={(value: string) => update(`hydrometer[${i}].date`, value)}*/}
            {/*                        />*/}
            {/*                    </DataGridLabel>*/}
            {/*                    <DataGridInput*/}
            {/*                        col={3}*/}
            {/*                        value={hydro.gravity.value}*/}
            {/*                        onChange={(value: string) => update(`hydrometer[${i}].gravity.value`, value)}*/}
            {/*                        onBlur={(value: string) => updateScalar(`hydrometer[${i}].gravity`, value)}*/}
            {/*                    />*/}
            {/*                </DataGridRow>*/}
            {/*            ))}*/}
            {/*        </DataGrid>*/}
            {/*    </div>*/}
            {/*    <div></div>*/}
            {/*</ScreenTwoCol>*/}
        </>
    )
}