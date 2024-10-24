"use client";

import {ScreenH1, ScreenH2, ScreenH3, ScreenP, InputDate} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";
import {Fragment, useCallback} from "react";
import DataGrid from "@/component/data-grid";
import Grain from "@/model/grain";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import useDataGrid from "@/component/data-grid/useDataGrid";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import FormCheckbox from "@/component/form/checkbox";
import DataGridSelect from "@/component/data-grid/select";
import grains from "@/data/grains";
import hops from "@/data/hops";
import yeasts from "@/data/yeasts";
import ScreenTwoCol from "@/component/screen/two-col";
import Screen from "@/component/screen";

export type PlanningProps = { batch: Batch; recipe: Recipe; onChange: (batch: Batch) => void }
export default function Planning({ batch, recipe, onChange }: PlanningProps) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);

    return (
        <>
            <Screen>
                <ScreenH1 className="mb-2">Batch Planning</ScreenH1>
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH2>{recipe.name}</ScreenH2>
                    <ScreenH3>{batch.name || ""}</ScreenH3>
                    <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                    <ScreenP>
                        Brewed on:
                        <InputDate
                            className="ml-1"
                            primary
                            align="right"
                            onChange={useCallback((value: string) => update(`brewDate`, value), [])}
                            value={data.brewDate} />
                    </ScreenP>
                </div>
            </Screen>
            <ScreenTwoCol>
                <div>
                    <ScreenH3>Grain</ScreenH3>
                    <DataGrid>
                        {data.grains.map((grain: Grain, i) => (
                            <Fragment key={`grain-${grain.name}-${i}`}>
                                <DataGridRow>
                                    <DataGridLabel>
                                        <DataGridSelect data={grains.map((({ name }) => ({ value: name, name })))} value={grain.name} />
                                    </DataGridLabel>
                                    <DataGridInput value={grain.weight} onChange={(value: string) => update(`grains[${i}].weight`, value)} col={3} />
                                </DataGridRow>
                            </Fragment>
                        ))}
                    </DataGrid>
                    <ScreenH3>Hops</ScreenH3>
                    <DataGrid>
                        {data.hops.map((hop: Hop, i) => (
                            <Fragment key={`grain-${hop.name}-${i}`}>
                                <DataGridRow>
                                    <DataGridLabel>
                                        <DataGridSelect data={hops.map((({ name }) => ({ value: name, name })))} value={hop.name} />
                                    </DataGridLabel>
                                    <DataGridInput value={hop.weight} onChange={(value: string) => update(`hops[${i}].weight`, value)} col={2} />
                                    <DataGridInput value={hop.boil} onChange={(value: string) => update(`hops[${i}].boil`, value)} col={3} />
                                </DataGridRow>
                            </Fragment>
                        ))}
                    </DataGrid>
                </div>
                <div>
                    <ScreenH3>Yeast</ScreenH3>
                    <DataGrid>
                        {data.yeast.map((yeast: Yeast, i) => (
                            <Fragment key={`yeast-${yeast.name}-${i}`}>
                                <DataGridRow key={`grain-${yeast.name}-${i}`}>
                                    <DataGridLabel>
                                        <DataGridSelect data={yeasts.map((({ name }) => ({ value: name, name })))} value={yeast.name} />
                                    </DataGridLabel>
                                    <DataGridInput value={yeast.scalar} onChange={(value: string) => update(`yeast[${i}].scalar`, value)} col={3} />
                                </DataGridRow>
                                <FormCheckbox onChange={() => toggle(`yeast[${i}].starter`)} checked={yeast.starter}>
                                    Starter?
                                </FormCheckbox>
                            </Fragment>
                        ))}
                    </DataGrid>
                </div>
            </ScreenTwoCol>
        </>
    )
}
