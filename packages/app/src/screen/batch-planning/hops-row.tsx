import {memo, useCallback, useMemo} from "react";
import {KbHop} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Hop from "@/model/hop";
import {kbHopToHop} from "@/transform/kbHopToHop";


export type BatchPlanningHopsRowProps = {
    row: number;
    hop: Hop;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbHops: KbHop[];
    kbHopsIndex: Map<string, KbHop>;
};

function BatchPlanningHopsRow({ row, hop, remove, update, updateScalar, kbHops, kbHopsIndex }: BatchPlanningHopsRowProps) {
    const hopOptions = useMemo(() => kbHops.map((({ name }) => ({ value: name, name }))), [kbHops]);

    const onRemoveHop = useCallback(() => remove("hops", row), [remove, row]);
    const onChangeHop = useCallback((value: string) => update(`hops[${row}]`, kbHopToHop(kbHopsIndex!.get(value)!)), [update, row, kbHopsIndex]);
    const onChangeWeightValue = useCallback((value: string) => update(`hops[${row}].weight.value`, value), [update, row]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`hops[${row}].weight`, value), [updateScalar, row]);
    const onChangeBoilValue = useCallback((value: string) => update(`hops[${row}].boil.value`, value), [update, row]);
    const onBlurBoil = useCallback((value: string) => updateScalar(`hops[${row}].boil`, value), [updateScalar, row]);
    const onChangeAlphaValue = useCallback((value: string) => update(`hops[${row}].alpha.value`, value), [update, row]);
    const onBlurAlpha = useCallback((value: string) => updateScalar(`hops[${row}].alpha`, value), [updateScalar, row]);

    return (
        <DataGridRow
            zebra
            label="hop details"
            expandContent={
                <DataGrid>
                    <DataGridRow zebra={false}>
                        <DataGridLabel tiny className="ml-6">Alpha %</DataGridLabel>
                        <DataGridInput
                            colStart={3}
                            value={hop.alpha.value}
                            onChange={onChangeAlphaValue}
                            onBlur={onBlurAlpha}
                        />
                    </DataGridRow>
                </DataGrid>
            }
        >
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveHop} />
                <DataGridSelect
                    data={hopOptions}
                    value={hop.name}
                    onChange={onChangeHop}
                />
            </DataGridLabel>
            <DataGridInput
                colStart={2}
                value={hop.weight.value}
                onChange={onChangeWeightValue}
                onBlur={onBlurWeight}
            />
            <DataGridInput
                colStart={3}
                value={hop.boil.value}
                onChange={onChangeBoilValue}
                onBlur={onBlurBoil}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(BatchPlanningHopsRow);
