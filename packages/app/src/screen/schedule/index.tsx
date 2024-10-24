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
import useDataGrid from "@/component/data-grid/useDataGrid";
import {Fragment} from "react";
import Additive from "@/model/additive";
import ScreenTwoCol from "@/component/screen/two-col";
import DataGridLabelNote from "@/component/data-grid/label-note";

export type BrewDayProps = { batch: Batch, onChange: (batch: Batch) => void; };
export default function BrewDay({ batch, onChange }: BrewDayProps) {
    const [data, update] = useDataGrid<Batch>(batch, onChange);

    return (
        <ScreenTwoCol>
            <ScreenH1 className="col-start-1 lg:col-span-2 col-span-1 mb-2">Brew Schedule</ScreenH1>
            <div>
                <ScreenH3>1. Mash</ScreenH3>
                {data.mash.map((m, i) => (
                    <Fragment key={`mash-${m.name}-${i}`}>
                        <ScreenH4>{m.name} - {m.time}</ScreenH4>
                        <DataGrid>
                            {data.grains.map((grain: Grain, i) => (
                                <DataGridRow key={`grain-${grain.name}-${i}`}>
                                    <DataGridLabel>{grain.name} <DataGridLabelNote>({grain.weight})</DataGridLabelNote></DataGridLabel>
                                    <DataGridInput readonly value={m.temp} col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}

                <ScreenH3>2. Boil</ScreenH3>
                {data.boil.map((m, i) => (
                    <Fragment key={`boil-${m.name}-${i}`}>
                        <ScreenH4>{m.name}  - {m.time}</ScreenH4>
                        <DataGrid>
                            {data.hops.map((hop: Hop, i) => (
                                <DataGridRow key={`hop-${hop.name}-${i}`}>
                                    <DataGridLabel>{hop.name} <DataGridLabelNote>({hop.alpha})</DataGridLabelNote></DataGridLabel>
                                    <DataGridInput readonly value={hop.weight} col={2} />
                                    <DataGridInput value={hop.boil} update={(value: string) => update(`hops[${i}].boil`, value)} col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}
                {data.additives.length ? (
                    <Fragment>
                        <ScreenH4>Additives</ScreenH4>
                        <DataGrid>
                            {data.additives.map((additive: Additive, i) => (
                                <DataGridRow key={`additive-${additive.name}-${i}`}>
                                    <DataGridLabel>{additive.name}</DataGridLabel>
                                    {additive.scalar
                                        ? <DataGridInput value={additive.scalar} update={(value: string) => update(`additives[${i}].scalar`, value)} col={3} />
                                        : <></>}
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ) : <></>}
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <DataGrid>
                    {data.yeast.map((yeast: Yeast, i) => (
                        <DataGridRow key={`yeast-${yeast.name}-${i}`}>
                            <DataGridLabel>{yeast.name}</DataGridLabel>
                            <DataGridInput value={yeast.scalar} update={(value: string) => update(`yeast[${i}].scalar`, value)} col={3} />
                        </DataGridRow>
                    ))}
                </DataGrid>

                <ScreenH3>Gravity Readings</ScreenH3>
                <DataGrid>
                    {data.hydrometer.map((hydro: Hydrometer, i) => (
                        <DataGridRow key={`hydro-${hydro.name}-${i}`}>
                            <DataGridLabel>
                                <DataGridInput type="date" value={hydro.date} update={(value: string) => update(`hydrometer[${i}].date`, value)} col={1} />
                            </DataGridLabel>
                            <DataGridInput value={hydro.gravity} update={(value: string) => update(`hydrometer[${i}].gravity`, value)} col={3} />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </div>
        </ScreenTwoCol>
    )
}