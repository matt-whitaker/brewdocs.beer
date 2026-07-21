import {Phase} from "@/model/batch";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import {Fragment, memo, useCallback} from "react";
import {MoveFn, RemoveFn} from "@/hooks/useJsonEdit";
import {Chevron} from "@/component/svg";
import {CHEVRON, CHEVRON_ICON} from "@/component/data-grid";
import classNames from "classnames";

export type PlanningPhasesRowProps = {
    row: number;
    phase: Phase;
    /** false once only one phase is left — the schedule screen always reads phases[0] */
    removable: boolean;
    first: boolean;
    last: boolean;
    remove: RemoveFn;
    move: MoveFn;
}

function PlanningPhasesRow({ row, phase, removable, first, last, remove, move }: PlanningPhasesRowProps) {
    const onRemovePhase = useCallback(() => remove("phases", row), [remove, row]);
    const onMoveUp = useCallback(() => move("phases", row, row - 1), [move, row]);
    const onMoveDown = useCallback(() => move("phases", row, row + 1), [move, row]);

    return (
        <Fragment>
            <DataGridRow zebra>
                <DataGridLabel className={removable ? "ml-6" : ""} cols={4}>
                    {removable && <DataGridRemoveButton onClick={onRemovePhase} />}
                    {phase.name}
                </DataGridLabel>
                <div className="col-start-5 col-span-2 flex items-center justify-end gap-x-1">
                    <button
                        type="button"
                        aria-label={`Move ${phase.name} earlier`}
                        disabled={first}
                        onClick={onMoveUp}
                        className={CHEVRON}
                    >
                        <Chevron className={classNames(CHEVRON_ICON, "rotate-180")} />
                    </button>
                    <button
                        type="button"
                        aria-label={`Move ${phase.name} later`}
                        disabled={last}
                        onClick={onMoveDown}
                        className={CHEVRON}
                    >
                        <Chevron className={CHEVRON_ICON} />
                    </button>
                </div>
            </DataGridRow>
        </Fragment>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(PlanningPhasesRow);
