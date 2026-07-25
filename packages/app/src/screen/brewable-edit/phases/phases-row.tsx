import {memo, useCallback} from "react";
import {Chevron} from "@brewdocs.beer/design";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {MoveFn, RemoveFn} from "@/hooks/useJsonEdit";

const PHASES_PATH = "schedule.phases";
const MOVE_BUTTON = "btn btn-xs btn-ghost p-0 disabled:opacity-30";

export type RecipeEditPhasesRowProps = {
    /** index into brewable.schedule.phases */
    row: number;
    /** precomputed by the parent from the full phase list — see model/brewable's phaseLabel */
    label: string;
    /** false when this is the last phase of its type — see model/brewable's canRemovePhase */
    removable: boolean;
    /** total phase count — bounds the "move down" control */
    count: number;
    remove: RemoveFn;
    move: MoveFn;
};

function RecipeEditPhasesRow({ row, label, removable, count, remove, move }: RecipeEditPhasesRowProps) {
    const onRemovePhase = useCallback(() => remove(PHASES_PATH, row), [remove, row]);
    const onMoveUp = useCallback(() => move(PHASES_PATH, row, row - 1), [move, row]);
    const onMoveDown = useCallback(() => move(PHASES_PATH, row, row + 1), [move, row]);

    return (
        <DataGridRow zebra>
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
