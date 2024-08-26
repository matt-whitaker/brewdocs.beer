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

export default function BrewDay({ batch }: { batch: Batch|null }) {
    const [_batch, update] = useDataGrid<Batch>(batch, () => {});

    if (!_batch) return <Error>'batch' missing</Error>

    return (
        <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <div>
                <ScreenH3>1. Mash</ScreenH3>
                {_batch.mash.map((m, i) => (
                    <Fragment key={`mash-${m.name}-${i}`}>
                        <ScreenH5>{i+1}. {m.name} - {m.time}</ScreenH5>,
                        <DataGrid>
                            {_batch.grains.map((grain: Grain, i) => (
                                <DataGridRow key={`grain-${grain.name}-${i}`}>
                                    <DataGridLabel editable>{grain.name}</DataGridLabel>
                                    <DataGridInput update={update} col={3} dot={`grains[${i}].weight`} value={grain.weight} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}

                <ScreenH3>2. Boil</ScreenH3>
                {_batch.boil.map((m, i) => (
                    <Fragment key={`boil-${m.name}-${i}`}>
                        <ScreenH5>{i+1}. {m.name}  - {m.time}</ScreenH5>,
                        <DataGrid>
                            {_batch.hops.map((hop: Hop, i) => (
                                <DataGridRow key={`hop-${hop.name}-${i}`}>
                                    <DataGridLabel editable>{hop.name}</DataGridLabel>
                                    <DataGridInput update={update} col={1} dot={`hops[${i}].weight`} value={hop.weight} />
                                    <DataGridInput update={update} col={2} dot={`hops[${i}].alpha`} value={hop.alpha} />
                                    <DataGridInput update={update} col={3} dot={`hops[${i}].boil`} value={hop.boil} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <DataGrid>
                    {_batch.yeast.map((yeast: Yeast, i) => (
                        <DataGridRow key={`yeast-${yeast.name}-${i}`}>
                            <DataGridLabel editable>{yeast.name}</DataGridLabel>
                            <DataGridInput update={update} col={3} dot={`yeast[${i}].temp`} value={yeast.temp} />
                        </DataGridRow>
                    ))}
                </DataGrid>

                <ScreenH3>Gravity Readings</ScreenH3>
                <DataGrid>
                    {_batch.hydrometer.map((hydro: Hydrometer, i) => (
                        <DataGridRow key={`hydro-${hydro.date}-${i}`}>
                            <DataGridLabel editable>{hydro.date}</DataGridLabel>
                            <DataGridInput update={update} col={3} dot={`hydrometer[${i}].gravity`} value={hydro.gravity} />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </div>
        </Screen>
    )
}