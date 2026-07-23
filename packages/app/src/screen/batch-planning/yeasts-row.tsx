import {Fragment, memo, useCallback, useMemo} from "react";
import {KbYeast} from "@brewdocs.beer/kb";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import { RemoveFn, UpdateFn, UpdateScalarFn } from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import {kbYeastToYeast} from "@/transform/kbYeastToYeast";


export type BatchPlanningYeastsRowProps = {
    row: number;
    yeast: Yeast;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbYeasts: KbYeast[];
    kbYeastsIndex: Map<string, KbYeast>;
};

function BatchPlanningYeastsRow({ row, yeast, remove, update, updateScalar, kbYeasts, kbYeastsIndex }: BatchPlanningYeastsRowProps) {
    const yeastOptions = useMemo(() => kbYeasts.map((({ name }) => ({ value: name, name }))), [kbYeasts]);

    const onRemoveYeast = useCallback(() => remove("yeasts", row), [remove, row]);
    const onChangeYeast = useCallback((value: string) => update(`yeasts[${row}]`, kbYeastToYeast(kbYeastsIndex!.get(value)!)), [update, row, kbYeastsIndex]);
    const onChangeTempValue = useCallback((value: string) => update(`yeasts[${row}].temp.value`, value), [update, row]);
    const onBlurTemp = useCallback((value: string) => updateScalar(`yeasts[${row}].temp`, value), [updateScalar, row]);

    return (
        <Fragment>
            <DataGridRow zebra reserveExpand>
                <DataGridLabel className="ml-6">
                    <DataGridRemoveButton onClick={onRemoveYeast} />
                    <DataGridSelect
                        data={yeastOptions}
                        value={yeast.name}
                        onChange={onChangeYeast}
                    />
                </DataGridLabel>
                <DataGridInput
                    colStart={3}
                    value={yeast.temp.value}
                    onChange={onChangeTempValue}
                    onBlur={onBlurTemp}
                />
            </DataGridRow>
            {/*<FormCheckbox onChange={() => toggle(`yeasts[${row}].starter`)} checked={yeasts.starter}>*/}
            {/*    Starter?*/}
            {/*</FormCheckbox>*/}
        </Fragment>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(BatchPlanningYeastsRow);