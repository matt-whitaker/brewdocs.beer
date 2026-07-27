import {useCallback} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import Brewable from "@/model/brewable";
import BrewableEdit from "@/screen/brewable-edit";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/disambiguation";

export type BatchPlanningProps = {
    batchId: string;
    onChange: (patch: Partial<Batch>) => void
};

// A name/brewDate header, then BrewableEdit for the Ingredients/Equipment/Phases
// tabs, mirroring recipe-edit. brewDate stays header chrome (a single field
// doesn't warrant its own panelsBefore panel) via its own useJsonEdit<Batch>.
// The header and BrewableEdit each save only the slice they own (brewDate /
// brewable); updateBatch merges each onto the freshest stored batch, so neither
// clobbers the other's edit — no ref to the whole batch needed here.
export default function BatchPlanning({ batchId, onChange }: BatchPlanningProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);

    const onChangeHeader = useCallback((b: Batch) => onChange({ brewDate: b.brewDate }), [onChange]);
    const [data, update] = useJsonEdit<Batch>(batch, onChangeHeader);
    const updateDate = useCallback((value: string) => update("brewDate", value), [update]);

    const onChangeBrewable = useCallback((brewable: Brewable) => onChange({ brewable }), [onChange]);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH3>{batch.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                <DataGrid className="mt-2">
                    <DataGridRow>
                        <DataGridLabel cols={3}>Brewed on</DataGridLabel>
                        <DataGridInput cols={3} type="date" value={data.brewDate} onChange={updateDate} />
                    </DataGridRow>
                </DataGrid>
            </div>
            <BrewableEdit
                brewable={batch.brewable}
                onChangeBrewable={onChangeBrewable}
                name="batch.planning"
                defaultTab="Ingredients"
            />
        </Screen>
    );
}
