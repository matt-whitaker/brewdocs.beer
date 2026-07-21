import {ScreenH1, ScreenH2, ScreenH3, ScreenP, InputDate} from "@brewdocs.beer/design";
import Batch from "@/model/batch";

import useJsonEdit from "@/hooks/useJsonEdit";
import Screen from "@/component/screen";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import PlanningHops from "@/screen/planning/hops";
import PlanningYeasts from "@/screen/planning/yeasts";
import PlanningGrains from "@/screen/planning/grains";
import PlanningEquipment from "@/screen/planning/equipment";
import {useBatch} from "@/state/batches";
import {useRecipe} from "@/state/recipes";
import {useCallback} from "react";

export type PlanningProps = {
    batchId: string;
    onChange: (batch: Batch) => void
}
export default function Planning({ batchId, onChange }: PlanningProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipe(batch.recipeId);
    const [data, update, updateScalar,, add, remove] = useJsonEdit<Batch>(batch, onChange);

    const updateDate = useCallback((value: string) => update(`brewDate`, value), [])

    return (
        <Screen>
            <ScreenH1 className="mb-2">Batch Planning</ScreenH1>
            <div className="lg:max-w-[80%] pb-4 relative">
                <ScreenH2 className="first-of-type:mt-0">{recipe.name}</ScreenH2>
                <ScreenH3>{batch.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                <ScreenP>
                    Brewed on:
                    <InputDate
                        className="ml-1"
                        primary
                        align="right"
                        onChange={updateDate}
                        value={data.brewDate} />
                </ScreenP>
            </div>
            <PanelSwitcher compact name="planning" defaultTab="Ingredients">
                <PanelSwitcherContent title="Ingredients">
                    <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
                        <div>
                            <PlanningGrains
                                grains={data.grains}
                                add={add}
                                remove={remove}
                                update={update}
                                updateScalar={updateScalar}
                            />
                            <PlanningHops
                                hops={data.hops}
                                add={add}
                                remove={remove}
                                update={update}
                                updateScalar={updateScalar}
                            />
                        </div>
                        <div>
                            <PlanningYeasts
                                yeasts={data.yeasts}
                                add={add}
                                remove={remove}
                                update={update}
                                updateScalar={updateScalar}
                            />
                        </div>
                    </div>
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Equipment">
                    <PlanningEquipment
                        phases={data.phases}
                        add={add}
                        remove={remove}
                        update={update}
                    />
                </PanelSwitcherContent>
            </PanelSwitcher>
        </Screen>
    )
}
