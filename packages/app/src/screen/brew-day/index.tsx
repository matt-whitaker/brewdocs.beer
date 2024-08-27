"use client";

import Screen from "../../component/screen";
import {ScreenH3, ScreenH5} from "@/component/typography";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Batch from "@/model/batch";
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
                                    <DataGridInput<Batch> value={grain.weight} update={(value: string) => update(`grains[${i}].weight`, value)} col={3} />
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
                                    <DataGridInput<Batch> value={hop.weight} update={(value: string) => update(`hops[${i}].weight`, value)} col={1} />
                                    <DataGridInput<Batch> value={hop.alpha} update={(value: string) => update(`hops[${i}].alpha`, value)} col={2} />
                                    <DataGridInput<Batch> value={hop.boil} update={(value: string) => update(`hops[${i}].boil`, value)} col={3} />
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
                            <DataGridInput<Batch> value={yeast.temp} update={(value: string) => update(`yeast[${i}].temp`, value)} col={3} />
                        </DataGridRow>
                    ))}
                </DataGrid>

                <ScreenH3>Gravity Readings</ScreenH3>
                <DataGrid>
                    {data.hydrometer.map((hydro: Hydrometer, i) => (
                        <DataGridRow key={`hydro-${hydro.date}-${i}`}>
                            <DataGridLabel editable>{hydro.date}</DataGridLabel>
                            <DataGridInput<Batch> value={hydro.gravity} update={(value: string) => update(`hydrometer[${i}].gravity`, value)} col={3} />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </div>
        </Screen>
    )
}