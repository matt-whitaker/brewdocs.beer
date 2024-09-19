"use client";

import Screen from "../../component/screen";
import {ScreenH1, ScreenH2, ScreenH3, ScreenP} from "@/component/typography";
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
import TextInput from "@/component/form/text-input";
import Checkbox from "@/component/form/checkbox";
import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import DateInput from "@/component/form/date-input";

export type PlanningProps = { batch: Batch; recipe: Recipe; onChange: (batch: Batch) => void }
export default function Planning({ batch, recipe, onChange }: PlanningProps) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);

    return (
        <Screen>
            <ScreenH1>Batch Planning</ScreenH1>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold pt-2">
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH2>{recipe.name}</ScreenH2>
                    <ScreenH3>{batch.name || ""}</ScreenH3>
                    <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                    <ScreenP>
                        Brewed on:
                        <DateInput
                            className="ml-2 input-primary text-right placeholder:text-right"
                            onChange={useCallback((value: string) => update(`brewDate`, value), [])}
                            value={data.brewDate} />
                    </ScreenP>
                </div>
            </div>
            <div className="pt-2">
                <ScreenH3>Grain</ScreenH3>
                <DataGrid>
                    {data.grains.map((grain: Grain, i) => (
                        <Fragment key={`grain-${grain.name}-${i}`}>
                            <DataGridRow>
                                <DataGridLabel className="flex items-center -ml-2">
                                    {/*<UpDown className="w-4 mr-2" />*/}
                                    {grain.name}
                                </DataGridLabel>
                                <DataGridInput value={grain.weight} update={(value: string) => update(`grains[${i}].weight`, value)} col={3} />
                            </DataGridRow>
                        </Fragment>
                    ))}
                </DataGrid>
                <ScreenH3>Hops</ScreenH3>
                <DataGrid>
                    {data.hops.map((hop: Hop, i) => (
                        <Fragment key={`grain-${hop.name}-${i}`}>
                            <DataGridRow>
                                <DataGridLabel className="flex items-center -ml-2">
                                    {/*<UpDown className="w-4 mr-2" />*/}
                                    {hop.name}
                                </DataGridLabel>
                                <DataGridInput value={hop.weight} update={(value: string) => update(`hops[${i}].weight`, value)} col={2} />
                                <DataGridInput value={hop.alpha} update={(value: string) => update(`hops[${i}].alpha`, value)} col={3} />
                            </DataGridRow>
                        </Fragment>
                    ))}
                </DataGrid>
                <ScreenH3>Yeast</ScreenH3>
                <DataGrid>
                    {data.yeast.map((yeast: Yeast, i) => (
                        <Fragment >
                            <DataGridRow key={`grain-${yeast.name}-${i}`}>
                                <DataGridLabel className="flex items-center -ml-2">
                                    {/*<UpDown className="w-4 mr-2" />*/}
                                    {yeast.name}
                                </DataGridLabel>
                                <DataGridInput value={yeast.scalar} update={(value: string) => update(`yeast[${i}].scalar`, value)} col={3} />
                            </DataGridRow>
                            <Checkbox onChange={() => toggle(`yeast[${i}].starter`)} checked={yeast.starter}>
                                Starter?
                            </Checkbox>
                        </Fragment>
                    ))}
                </DataGrid>
            </div>
        </Screen>
    )
}
