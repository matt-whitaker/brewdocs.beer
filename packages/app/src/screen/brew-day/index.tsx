"use client";

import Screen from "../../component/screen";
import {ScreenH3, ScreenH5} from "@/component/typography";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Batch from "@/model/batch";
import Error from "@/component/error";
import Grain from "@/model/grain";
import Hydrometer from "@/model/hydrometer";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import useDataGrid from "@/component/data-grid/useDataGrid";
import {Fragment} from "react";

export type BrewDayProps = { batch: Batch, onChange: (batch: Batch) => void; };
export default function BrewDay({ batch, onChange }: BrewDayProps) {
    const [data, update] = useDataGrid<Batch>(batch, onChange);

    return (
        <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <div>
                <ScreenH3>1. Mash</ScreenH3>
                {data.mash.map((m, i) => (
                    <Fragment key={`mash-${m.name}-${i}`}>
                        <ScreenH5>{i+1}. {m.name} - {m.time}</ScreenH5>,
                        <DataGrid>
                            {data.grains.map((grain: Grain, i) => (
                                <DataGridRow key={`grain-${grain.name}-${i}`}>
                                    <DataGridLabel editable>{grain.name}</DataGridLabel>
                                    <DataGridInput<Batch> update={update} col={3} dot={`grains[${i}].weight`} data={data} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}

                <ScreenH3>2. Boil</ScreenH3>
                {data.boil.map((m, i) => (
                    <Fragment key={`boil-${m.name}-${i}`}>
                        <ScreenH5>{i+1}. {m.name}  - {m.time}</ScreenH5>,
                        <DataGrid>
                            {data.hops.map((hop: Hop, i) => (
                                <DataGridRow key={`hop-${hop.name}-${i}`}>
                                    <DataGridLabel editable>{hop.name}</DataGridLabel>
                                    <DataGridInput<Batch> update={update} col={1} dot={`hops[${i}].weight`} data={data} />
                                    <DataGridInput<Batch> update={update} col={2} dot={`hops[${i}].alpha`} data={data} />
                                    <DataGridInput<Batch> update={update} col={3} dot={`hops[${i}].boil`} data={data} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <DataGrid>
                    {data.yeast.map((yeast: Yeast, i) => (
                        <DataGridRow key={`yeast-${yeast.name}-${i}`}>
                            <DataGridLabel editable>{yeast.name}</DataGridLabel>
                            <DataGridInput<Batch> update={update} col={3} dot={`yeast[${i}].temp`} data={data} />
                        </DataGridRow>
                    ))}
                </DataGrid>

                <ScreenH3>Gravity Readings</ScreenH3>
                <DataGrid>
                    {data.hydrometer.map((hydro: Hydrometer, i) => (
                        <DataGridRow key={`hydro-${hydro.date}-${i}`}>
                            <DataGridLabel editable>{hydro.date}</DataGridLabel>
                            <DataGridInput<Batch> update={update} col={3} dot={`hydrometer[${i}].gravity`} data={data} />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </div>
        </Screen>
    )
}