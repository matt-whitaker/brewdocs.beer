import {memo, useCallback, useMemo} from "react";
import {Chevron} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, MoveFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase} from "@/model/brewable";
import RecipeEditPhaseEquipmentAddRow from "@/screen/recipe-edit-phases/phase-equipment-add-row";
import RecipeEditPhaseEquipmentRow from "@/screen/recipe-edit-phases/phase-equipment-row";

const PHASES_PATH = "brewable.schedule.phases";
const MOVE_BUTTON = "btn btn-xs btn-ghost p-0 disabled:opacity-30";

export type RecipeEditPhasesRowProps = {
    /** index into brewable.schedule.phases */
    row: number;
    phase: BrewablePhase;
    /** precomputed by the parent from the full phase list — see model/brewable's phaseLabel */
    label: string;
    /** false when this is the last phase of its type — see model/brewable's canRemovePhase */
    removable: boolean;
    /** total phase count — bounds the "move down" control */
    count: number;
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    move: MoveFn;
};

function RecipeEditPhasesRow({ row, phase, label, removable, count, add, remove, update, move }: RecipeEditPhasesRowProps) {
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");

    const onRemovePhase = useCallback(() => remove(PHASES_PATH, row), [remove, row]);
    const onMoveUp = useCallback(() => move(PHASES_PATH, row, row - 1), [move, row]);
    const onMoveDown = useCallback(() => move(PHASES_PATH, row, row + 1), [move, row]);

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
            <div className="col-span-2 flex items-center justify-end gap-x-1">
                <button type="button" aria-label={`Move ${label} up`} disabled={row === 0} onClick={onMoveUp} className={MOVE_BUTTON}>
                    <Chevron className="w-4 rotate-180" />
                </button>
                <button type="button" aria-label={`Move ${label} down`} disabled={row === count - 1} onClick={onMoveDown} className={MOVE_BUTTON}>
                    <Chevron className="w-4" />
                </button>
            </div>
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditPhasesRow);
