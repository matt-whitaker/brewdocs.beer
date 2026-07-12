import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import useJsonEdit from "@/hooks/useJsonEdit";
import {Fragment} from "react";
import ScreenTwoCol from "@/component/screen/two-col";
import ScheduleMash from "@/screen/schedule/mash";
import ScheduleBoil from "@/screen/schedule/boil";
import SchedulePitch from "@/screen/schedule/pitch";
import ScheduleChill from "@/screen/schedule/chill";
import {useBatch} from "@/state/batches";
import {useSuspenseRecipe} from "@/state/recipes";

export type ScheduleProps = { batchId: string; onChange: (batch: Batch) => void; };
export default function Schedule({ batchId, onChange }: ScheduleProps) {
    const batch = useBatch(batchId);
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
                    <ScheduleChill hydro={data.hydrometer[2]} hydroIndex={2} update={update} updateScalar={updateScalar} />
                    <SchedulePitch yeast={data.yeasts} update={update} updateScalar={updateScalar} />
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