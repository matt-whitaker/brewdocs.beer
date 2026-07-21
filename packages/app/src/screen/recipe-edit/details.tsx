import {KbRecipe} from "@brewdocs.beer/kb";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import {useCallback} from "react";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipe-edit.details";

export type RecipeEditDetailsProps = {
    recipe: KbRecipe;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function RecipeEditDetails({ recipe, update, updateScalar }: RecipeEditDetailsProps) {
    const session = useSession();

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
                <DataGridInput col={1} cols={3} value={recipe.name} onChange={onChangeName} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Brewer</DataGridLabel>
                <DataGridInput col={1} cols={3} value={recipe.brewer} onChange={onChangeBrewer} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Type</DataGridLabel>
                <DataGridInput col={1} cols={3} value={recipe.type} onChange={onChangeType} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Description</DataGridLabel>
                <DataGridInput col={1} cols={3} value={recipe.description} onChange={onChangeDescription} />
            </DataGridRow>

            <DataGridSubheaderRow>Measurements</DataGridSubheaderRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Batch Size</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.batchSize.value}
                    onChange={onChangeBatchSizeValue}
                    onBlur={onBlurBatchSize}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Boil Time</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.boilTime.value}
                    onChange={onChangeBoilTimeValue}
                    onBlur={onBlurBoilTime}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>Efficiency</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.efficiency.value}
                    onChange={onChangeEfficiencyValue}
                    onBlur={onBlurEfficiency}
                />
            </DataGridRow>

            <DataGridSubheaderRow>Targets</DataGridSubheaderRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>OG</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.targets.og.value}
                    onChange={onChangeOgValue}
                    onBlur={onBlurOg}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>FG</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.targets.fg.value}
                    onChange={onChangeFgValue}
                    onBlur={onBlurFg}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>ABV</DataGridLabel>
                <DataGridInput
                    col={1}
                    cols={3}
                    value={recipe.targets.abv.value}
                    onChange={onChangeAbvValue}
                    onBlur={onBlurAbv}
                />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>IBU</DataGridLabel>
                <DataGridInput col={1} cols={3} value={recipe.targets.ibu} onChange={onChangeIbu} />
            </DataGridRow>
            <DataGridRow zebra>
                <DataGridLabel cols={3}>SRM</DataGridLabel>
                <DataGridInput col={1} cols={3} value={recipe.targets.srm} onChange={onChangeSrm} />
            </DataGridRow>
        </DataGrid>
    );
}
