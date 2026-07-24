import {memo, useCallback} from "react";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {Assignment, assignmentResourceName} from "@/model/brewable";

/**
 * Placeholder row for one assignment — name + remove only, standing in for
 * every `resourceType` until the next child adds the resource-narrowed
 * advanced fields (switching on `assignment.resourceType` to read/write
 * `assignment.resource`). `row` indexes `brewable.assignments` directly (the
 * flat array, not the phase/type-filtered view rendered here), so a future
 * `update`/`updateScalar` dot-path is `brewable.assignments[${row}].resource...`.
 * `update`/`updateScalar` are threaded through already so that child doesn't
 * need to touch this layout or the add-row.
 */
export type RecipeEditAssignmentRowProps = {
    row: number;
    assignment: Assignment;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function RecipeEditAssignmentRow({ row, assignment, remove }: RecipeEditAssignmentRowProps) {
    const onRemove = useCallback(() => remove("brewable.assignments", row), [remove, row]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemove} />
                {assignmentResourceName(assignment)}
            </DataGridLabel>
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditAssignmentRow);
