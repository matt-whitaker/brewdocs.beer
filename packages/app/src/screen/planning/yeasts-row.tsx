import {KbYeast} from "@brewdocs.beer/kb";
import { RemoveFn, UpdateFn, UpdateScalarFn } from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {kbYeastToYeast} from "@/transform/kbYeastToYeast";
import DataGridInput from "@/component/data-grid/input";
import {Fragment, useCallback, useMemo} from "react";


export type PlanningYeastsRowProps = {
  row: number;
  yeast: Yeast;
  remove: RemoveFn;
  update: UpdateFn;
  updateScalar: UpdateScalarFn;
  kbYeasts: KbYeast[];
  kbYeastsIndex: Map<string, KbYeast>;
}

export default function PlanningYeastsRow({ row, yeast, remove, update, updateScalar, kbYeasts, kbYeastsIndex }: PlanningYeastsRowProps) {
  const yeastOptions = useMemo(() => kbYeasts.map((({ name }) => ({ value: name, name }))), [kbYeasts]);

  const onRemoveYeast = useCallback(() => remove("yeasts", row), [remove, row]);
  const onChangeYeast = useCallback((value: string) => update(`yeasts[${row}]`, kbYeastToYeast(kbYeastsIndex!.get(value)!)), [update, row, kbYeastsIndex]);
  const onChangeTempValue = useCallback((value: string) => update(`yeasts[${row}].temp.value`, value), [update, row]);
  const onBlurTemp = useCallback((value: string) => updateScalar(`yeasts[${row}].temp`, value), [updateScalar, row]);

  return (
      <Fragment>
        <DataGridRow zebra>
          <DataGridLabel className="ml-6">
            <DataGridRemoveButton onClick={onRemoveYeast} />
            <DataGridSelect
                data={yeastOptions}
                value={yeast.name}
                onChange={onChangeYeast}
            />
          </DataGridLabel>
          <DataGridInput
              col={3}
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