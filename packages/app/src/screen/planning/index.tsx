"use client";

import {ScreenH1, ScreenH2, ScreenH3, ScreenP, InputDate} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";
import {Fragment} from "react";
import DataGrid from "@/component/data-grid";
import Grain from "@/model/grain";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import useJsonEdit from "@/state/useJsonEdit";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import FormCheckbox from "@/component/form/checkbox";
import DataGridSelect from "@/component/data-grid/select";
import ScreenTwoCol from "@/component/screen/two-col";
import Screen from "@/component/screen";
import kbHopsState, {useKbHops} from "@/state/kbHops";
import kbYeastsState, {useKbYeasts} from "@/state/kbYeasts";
import kbGrainsState, {useKbGrains} from "@/state/kbGrains";

export type PlanningProps = {
    batch: Batch;
    recipe: Recipe;
    onChange: (batch: Batch) => void
}
export default function Planning({ batch, recipe, onChange }: PlanningProps) {
    const [hops, hopsIndex] = useKbHops();
    const [yeasts, yeastsIndex] = useKbYeasts();
    const [grains, grainsIndex] = useKbGrains();

    const [data, update, toggle] = useJsonEdit<Batch>(batch, onChange);

    if (!hops || !hopsIndex || !yeasts || !yeastsIndex || !grains || !grainsIndex) {
        return null;
    }

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
                            onChange={(value: string) => update(`brewDate`, value)}
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
                                        <DataGridSelect
                                            data={grains.map((({ name }) => ({ value: name, name })))}
                                            value={grain.name}
                                            onChange={(value: string) => update(`grains[${i}]`, kbGrainsState.kbToState(grainsIndex?.get(value)!))}
                                        />
                                    </DataGridLabel>
                                    <DataGridInput
                                        value={grain.weight}
                                        onChange={(value: string) => update(`grains[${i}].weight`, value)} col={3}
                                    />
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
                                        <DataGridSelect
                                            data={hops.map((({ name }) => ({ value: name, name })))}
                                            value={hop.name}
                                            onChange={(value: string) => update(`hops[${i}]`, kbHopsState.kbToState(hopsIndex?.get(value)!))}
                                        />
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
                                        <DataGridSelect
                                            data={yeasts.map((({ name }) => ({ value: name, name })))}
                                            value={yeast.name}
                                            onChange={(value: string) => update(`yeasts[${i}]`, kbYeastsState.kbToState(yeastsIndex?.get(value)!))}
                                        />
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
