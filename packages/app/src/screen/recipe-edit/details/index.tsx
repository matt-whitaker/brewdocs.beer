import {useCallback} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import useEstimatedIbu from "@/hooks/useEstimatedIbu";
import useJsonEdit from "@/hooks/useJsonEdit";
import Recipe from "@/model/recipe";
import {usePatchRecipe, useRecipe} from "@/state/recipes";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipe-edit.details";

export type RecipeEditDetailsProps = {
    recipeId: string;
};
export default function RecipeEditDetails({ recipeId }: RecipeEditDetailsProps) {
    const recipe = useRecipe(recipeId);
    const session = useSession();
    const patchRecipe = usePatchRecipe(recipeId);

    // Details owns every field except the brewable, which the sibling BrewableEdit
    // owns — so patch our fields only and never write brewable back, or a late
    // debounced save (fired after a tab switch to the brewable editor) would
    // overwrite a brewable edit.
    const onChange = useCallback((r: Recipe) => {
        const {brewable: _brewable, ...rest} = r;
        patchRecipe(rest);
    }, [patchRecipe]);
    const [data, update, updateScalar] = useJsonEdit<Recipe>(recipe, onChange);

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const onChangeName = useCallback((value: string) => update("name", value), [update]);
    const onChangeBrewer = useCallback((value: string) => update("brewer", value), [update]);
    const onChangeType = useCallback((value: string) => update("type", value), [update]);
    const onChangeDescription = useCallback((value: string) => update("description", value), [update]);

    const onChangeBatchSizeValue = useCallback((value: string) => update("batchSize.value", value), [update]);
    const onBlurBatchSize = useCallback((value: string) => updateScalar("batchSize", value), [updateScalar]);
    const onChangeBoilTimeValue = useCallback((value: string) => update("boilTime.value", value), [update]);
    const onBlurBoilTime = useCallback((value: string) => updateScalar("boilTime", value), [updateScalar]);
    const onChangeEfficiencyValue = useCallback((value: string) => update("efficiency.value", value), [update]);
    const onBlurEfficiency = useCallback((value: string) => updateScalar("efficiency", value), [updateScalar]);

    const onChangeOgValue = useCallback((value: string) => update("targets.og.value", value), [update]);
    const onBlurOg = useCallback((value: string) => updateScalar("targets.og", value), [updateScalar]);
    const onChangeFgValue = useCallback((value: string) => update("targets.fg.value", value), [update]);
    const onBlurFg = useCallback((value: string) => updateScalar("targets.fg", value), [updateScalar]);
    const onChangeAbvValue = useCallback((value: string) => update("targets.abv.value", value), [update]);
    const onBlurAbv = useCallback((value: string) => updateScalar("targets.abv", value), [updateScalar]);
    const onChangeIbu = useCallback((value: string) => update("targets.ibu", value), [update]);
    const onChangeSrm = useCallback((value: string) => update("targets.srm", value), [update]);

    const estimatedIbu = useEstimatedIbu(data.brewable.assignments, data.batchSize, data.targets.og);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Details
            </DataGridHeaderRow>

            <DataGridRow zebra>
                <DataGridLabel cols={3}>Name</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="Name" value={data.name} onChange={onChangeName} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Brewer</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="Brewer" value={data.brewer} onChange={onChangeBrewer} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Type</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="Type" value={data.type} onChange={onChangeType} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Description</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="Description" value={data.description} onChange={onChangeDescription} />
            </DataGridRow>

            <DataGridSubheaderRow>Measurements</DataGridSubheaderRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Batch Size</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="Batch Size"
                    value={data.batchSize.value}
                    onChange={onChangeBatchSizeValue}
                    onBlur={onBlurBatchSize}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Boil Time</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="Boil Time"
                    value={data.boilTime.value}
                    onChange={onChangeBoilTimeValue}
                    onBlur={onBlurBoilTime}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Efficiency</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="Efficiency"
                    value={data.efficiency.value}
                    onChange={onChangeEfficiencyValue}
                    onBlur={onBlurEfficiency}
                />
            </DataGridRow>

            <DataGridSubheaderRow>Targets</DataGridSubheaderRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>OG</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="OG"
                    value={data.targets.og.value}
                    onChange={onChangeOgValue}
                    onBlur={onBlurOg}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>FG</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="FG"
                    value={data.targets.fg.value}
                    onChange={onChangeFgValue}
                    onBlur={onBlurFg}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>ABV</DataGridLabel>
                <DataGridInput
                    colStart={4}
                    cols={3}
                    label="ABV"
                    value={data.targets.abv.value}
                    onChange={onChangeAbvValue}
                    onBlur={onBlurAbv}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>IBU</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="IBU" value={data.targets.ibu} onChange={onChangeIbu} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Estimated IBU</DataGridLabel>
                <div className="col-start-4 col-span-3 flex items-center justify-end self-center pr-1 text-sm leading-6 lg:leading-8">
                    {estimatedIbu}
                </div>
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>SRM</DataGridLabel>
                <DataGridInput colStart={4} cols={3} label="SRM" value={data.targets.srm} onChange={onChangeSrm} />
            </DataGridRow>
        </DataGrid>
    );
}
