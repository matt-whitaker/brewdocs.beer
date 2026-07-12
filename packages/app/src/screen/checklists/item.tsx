import ChecklistItem from "@/component/checklist/item";
import {ToggleFn} from "@/hooks/useJsonEdit";
import {useCallback} from "react";

export type ChecklistsItemProps = {
    list: number;
    row: number;
    title: string;
    name: string;
    completed: boolean;
    toggle: ToggleFn;
}
export default function ChecklistsItem({ list, row, title, name, completed, toggle }: ChecklistsItemProps) {
    const toggleItem = useCallback(() => toggle(`checklists.[${list}].items.[${row}].completed`), [toggle, list, row]);

    return (
        <ChecklistItem
            name={`${title}-${name}`}
            checked={completed}
            onToggle={toggleItem}>
            {name}
        </ChecklistItem>
    )
}