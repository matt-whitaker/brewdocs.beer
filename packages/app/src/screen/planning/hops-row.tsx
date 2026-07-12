import {KbHop} from "@brewdocs.beer/kb";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Hop from "@/model/hop";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {kbHopToHop} from "@/transform/kbHopToHop";
import DataGridInput from "@/component/data-grid/input";
import {Fragment, useCallback, useMemo} from "react";


export type PlanningHopsRowProps = {
    row: number;
    hop: Hop;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbHops: KbHop[];
    kbHopsIndex: Map<string, KbHop>;
}

export default function PlanningHopsRow({ row, hop, remove, update, updateScalar, kbHops, kbHopsIndex }: PlanningHopsRowProps) {
    const hopOptions = useMemo(() => kbHops.map((({ name }) => ({ value: name, name }))), [kbHops]);

    const onRemoveHop = useCallback(() => remove("hops", row), [remove, row]);
    const onChangeHop = useCallback((value: string) => update(`hops[${row}]`, kbHopToHop(kbHopsIndex!.get(value)!)), [update, row, kbHopsIndex]);
    const onChangeWeightValue = useCallback((value: string) => update(`hops[${row}].weight.value`, value), [update, row]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`hops[${row}].weight`, value), [updateScalar, row]);
    const onChangeBoilValue = useCallback((value: string) => update(`hops[${row}].boil.value`, value), [update, row]);
    const onBlurBoil = useCallback((value: string) => updateScalar(`hops[${row}].boil`, value), [updateScalar, row]);

    return (
        <Fragment>
            <DataGridRow>
                <DataGridLabel className="ml-6">
                    <DataGridRemoveButton onClick={onRemoveHop} />
                    <DataGridSelect
                        data={hopOptions}
                        value={hop.name}
                        onChange={onChangeHop}
                    />
                </DataGridLabel>
                <DataGridInput
                    col={2}
                    value={hop.weight.value}
                    onChange={onChangeWeightValue}
                    onBlur={onBlurWeight}
                />
                <DataGridInput
                    col={3}
                    value={hop.boil.value}
                    onChange={onChangeBoilValue}
                    onBlur={onBlurBoil}
                />
            </DataGridRow>
        </Fragment>
    );
}