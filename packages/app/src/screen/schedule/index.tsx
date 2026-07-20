import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import useJsonEdit from "@/hooks/useJsonEdit";
import Screen from "@/component/screen";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import ScheduleMash from "@/screen/schedule/mash";
import ScheduleBoil from "@/screen/schedule/boil";
import SchedulePitch from "@/screen/schedule/pitch";
import ScheduleChill from "@/screen/schedule/chill";
import {useBatch} from "@/state/batches";

export type ScheduleProps = { batchId: string; onChange: (batch: Batch) => void; };
export default function Schedule({ batchId, onChange }: ScheduleProps) {
    const batch = useBatch(batchId);
    const [data, update, updateScalar] = useJsonEdit<Batch>(batch, onChange);

    return (
        <>
            <Screen>
                <ScreenH1 className="mb-2">Brew Schedule</ScreenH1>
                {/* the steps run in brew order, so the tablist is the sequence —
                    which is why the sections no longer carry their own headings */}
                <PanelSwitcher compact name="schedule" defaultTab="1. Mash">
                    <PanelSwitcherContent title="1. Mash">
                        <ScheduleMash
                            grains={data.grains}
                            mash={data.mash}
                            hydro={data.hydrometer[0]}
                            hydroIndex={0}
                            update={update}
                            updateScalar={updateScalar}
                        />
                    </PanelSwitcherContent>
                    <PanelSwitcherContent title="2. Boil">
                        <ScheduleBoil
                            boil={data.boil}
                            hops={data.hops}
                            additives={data.additives}
                            update={update}
                            updateScalar={updateScalar}
                        />
                    </PanelSwitcherContent>
                    <PanelSwitcherContent title="3. Chill">
                        <ScheduleChill hydro={data.hydrometer[2]} hydroIndex={2} update={update} updateScalar={updateScalar} />
                    </PanelSwitcherContent>
                    <PanelSwitcherContent title="4. Pitch">
                        <SchedulePitch yeast={data.yeasts} update={update} updateScalar={updateScalar} />
                    </PanelSwitcherContent>
                </PanelSwitcher>
            </Screen>
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