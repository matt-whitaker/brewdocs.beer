import {useCallback} from "react";
import {ScreenH1, ScreenH2, ScreenH3, ScreenP} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import BatchPlanningEquipment from "@/screen/batch-planning/equipment";
import BatchPlanningGrains from "@/screen/batch-planning/grains";
import BatchPlanningHops from "@/screen/batch-planning/hops";
import BatchPlanningPhases from "@/screen/batch-planning/phases";
import BatchPlanningYeasts from "@/screen/batch-planning/yeasts";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/recipeResource";

export type BatchPlanningProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function BatchPlanning({ batchId, onChange }: BatchPlanningProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);
    const [data, update, updateScalar,, add, remove, move] = useJsonEdit<Batch>(batch, onChange);

    const updateDate = useCallback((value: string) => update("brewDate", value), [update]);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH2 className="first-of-type:mt-0">{recipe.name}</ScreenH2>
                <ScreenH3>{batch.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                <DataGrid className="mt-2">
                    <DataGridRow>
                        <DataGridLabel cols={3}>Brewed on</DataGridLabel>
                        <DataGridInput col={1} cols={3} type="date" value={data.brewDate} onChange={updateDate} />
                    </DataGridRow>
                </DataGrid>
            </div>
            <PanelSwitcher compact name="planning" defaultTab="Ingredients">
                <PanelSwitcherContent title="Ingredients">
                    <BatchPlanningGrains
                        grains={data.grains}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                    <BatchPlanningHops
                        hops={data.hops}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                    <BatchPlanningYeasts
                        yeasts={data.yeasts}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Equipment">
                    <BatchPlanningEquipment
                        phases={data.phases}
                        add={add}
                        remove={remove}
                        update={update}
                    />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Phases">
                    <BatchPlanningPhases
                        phases={data.phases}
                        add={add}
                        remove={remove}
                        move={move}
                    />
                </PanelSwitcherContent>
            </PanelSwitcher>
        </Screen>
    );
}
