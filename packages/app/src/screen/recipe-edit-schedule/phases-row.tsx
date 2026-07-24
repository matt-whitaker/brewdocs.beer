import {memo, useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase} from "@/model/brewable";
import RecipeEditPhaseEquipmentAddRow from "@/screen/recipe-edit-schedule/phase-equipment-add-row";
import RecipeEditPhaseEquipmentRow from "@/screen/recipe-edit-schedule/phase-equipment-row";

export type RecipeEditPhasesRowProps = {
    /** index into brewable.schedule.phases */
    row: number;
    phase: BrewablePhase;
    /** precomputed by the parent from the full phase list — see model/brewable's phaseLabel */
    label: string;
    /** false when this is the last phase of its type — see model/brewable's canRemovePhase */
    removable: boolean;
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
};

function RecipeEditPhasesRow({ row, phase, label, removable, add, remove, update }: RecipeEditPhasesRowProps) {
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");

    const onRemovePhase = useCallback(() => remove("brewable.schedule.phases", row), [remove, row]);

    const equipmentRows = useMemo(() => phase.equipment.map((item, i) => (
        <RecipeEditPhaseEquipmentRow
            key={`equipment-${row}-${item.name}-${i}`}
            phase={row}
            row={i}
            item={item}
            remove={remove}
            update={update}
            equipment={equipmentCatalog}
            equipmentIndex={equipmentIndex} />
    )), [phase.equipment, row, remove, update, equipmentIndex]);

    return (
        <DataGridRow
            zebra
            label={`${label} equipment`}
            expandContent={
                <DataGrid>
                    {equipmentRows}
                    <RecipeEditPhaseEquipmentAddRow phase={row} add={add} equipment={equipmentCatalog} equipmentIndex={equipmentIndex} />
                </DataGrid>
            }
        >
            <DataGridLabel className={removable ? "ml-6" : ""} cols={4}>
                {removable && <DataGridRemoveButton onClick={onRemovePhase} />}
                {label}
            </DataGridLabel>
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditPhasesRow);
