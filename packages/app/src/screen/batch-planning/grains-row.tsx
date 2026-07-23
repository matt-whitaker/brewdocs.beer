import {Fragment, memo, useCallback, useMemo} from "react";
import {KbGrain} from "@brewdocs.beer/kb";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";
import {kbGrainToGrain} from "@/transform/kbGrainToGrain";

export type BatchPlanningGrainsRowProps = {
    row: number;
    grain: Grain;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbGrains: KbGrain[];
    kbGrainsIndex: Map<string, KbGrain>;
};

function BatchPlanningGrainsRow({ row, grain, remove, update, updateScalar, kbGrains, kbGrainsIndex }: BatchPlanningGrainsRowProps) {
    const grainOptions = useMemo(() => kbGrains.map((({ name }) => ({ value: name, name }))), [kbGrains]);

    const onRemoveGrain = useCallback(() => remove("grains", row), [remove, row]);
    const onChangeGrain = useCallback((value: string) => update(`grains[${row}]`, kbGrainToGrain(kbGrainsIndex!.get(value)!)), [update, row, kbGrainsIndex]);
    const onChangeWeightValue = useCallback((value: string) => update(`grains[${row}].weight.value`, value), [update, row]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`grains[${row}].weight`, value), [updateScalar, row]);

    return (
        <Fragment>
            <DataGridRow zebra reserveExpand>
                <DataGridLabel className="ml-6">
                    <DataGridRemoveButton onClick={onRemoveGrain} />
                    <DataGridSelect
                        data={grainOptions}
                        value={grain.name}
                        onChange={onChangeGrain}
                    />
                </DataGridLabel>
                <DataGridInput
                    colStart={3}
                    value={grain.weight.value}
                    onChange={onChangeWeightValue}
                    onBlur={onBlurWeight}
                />
            </DataGridRow>
        </Fragment>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(BatchPlanningGrainsRow);