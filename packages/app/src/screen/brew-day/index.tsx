"use client";

import Screen from "../../component/screen";
import {ScreenH3, ScreenH5} from "@/component/typography";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import batchService from "@/service/batch";
import useService from "@/service/useService";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import Grain from "@/model/grain";
import Hydrometer from "@/model/hydrometer";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import useDataGrid from "@/component/data-grid/useDataGrid";

export default function BrewDay() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<Batch|null>(batchService.get, null, [batchId]);
    const [_batch, update] = useDataGrid<Batch>(batch);

    if (!_batch) return <Error>'batch' missing</Error>

    return (
        <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <div>
                <ScreenH3>1. Mash</ScreenH3>
                {_batch.mash.map((m, i) => [
                    <ScreenH5 key={i}>{i+1}. {m.name} - {m.time}</ScreenH5>,
                    <DataGrid key={i}>
                        {_batch.grains.map((grain: Grain, i) => (
                            <DataGridRow key={i}>
                                <DataGridLabel editable>{grain.name}</DataGridLabel>
                                <DataGridInput update={update} col={3} dot={`grains[${i}.weight`} value={grain.weight} />
                            </DataGridRow>
                        ))}
                    </DataGrid>
                ])}

                <ScreenH3>2. Boil</ScreenH3>
                {_batch.boil.map((m, i) => [
                    <ScreenH5 key={i}>{i+1}. {m.name}  - {m.time}</ScreenH5>,
                    <DataGrid key={i}>
                        {_batch.hops.map((hop: Hop, i) => (
                            <DataGridRow key={i}>
                                <DataGridLabel editable>{hop.name}</DataGridLabel>
                                <DataGridInput update={update} col={1} dot={`hops[${i}.weight`} value={hop.weight} />
                                <DataGridInput update={update} col={2} dot={`hops[${i}.alpha`} value={hop.alpha} />
                                <DataGridInput update={update} col={3} dot={`hops[${i}.boil`} value={hop.boil} />
                            </DataGridRow>
                        ))}
                    </DataGrid>
                ])}
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <DataGrid>
                    {_batch.yeast.map((yeast: Yeast, i) => (
                        <DataGridRow key={i}>
                            <DataGridLabel editable>{yeast.name}</DataGridLabel>
                            <DataGridInput update={update} col={3} dot={`yeast[${i}.temp`} value={yeast.temp} />
                        </DataGridRow>
                    ))}
                </DataGrid>

                <ScreenH3>Gravity Readings</ScreenH3>
                <DataGrid>
                    {_batch.hydrometer.map((hydro: Hydrometer, i) => (
                        <DataGridRow key={i}>
                            <DataGridLabel editable>{hydro.date}</DataGridLabel>
                            <DataGridInput update={update} col={3} dot={`hydrometer[${i}].gravity`} value={hydro.gravity} />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </div>
        </Screen>
    )
}