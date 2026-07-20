import {memo, useCallback} from "react";
import {ToggleFn} from "@/hooks/useJsonEdit";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridCheckbox from "@/component/data-grid/checkbox";

export type ChecklistsItemProps = {
    list: number;
    row: number;
    title: string;
    name: string;
    completed: boolean;
    toggle: ToggleFn;
}

function ChecklistsItem({ list, row, title, name, completed, toggle }: ChecklistsItemProps) {
    const id = `checklist-${title}-${name}`;
    const toggleItem = useCallback(() => toggle(`checklists[${list}].items[${row}].completed`), [toggle, list, row]);

    return (
        <DataGridRow zebra>
            {/* no value column here, so the label spans the full grid */}
            <DataGridLabel className="flex items-center col-span-6" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={completed}
                    onChange={toggleItem} />
                {name}
            </DataGridLabel>
        </DataGridRow>
    );
}

// props are primitives plus a stable toggle, so ticking one item doesn't
// re-render the rest of the list
export default memo(ChecklistsItem);
