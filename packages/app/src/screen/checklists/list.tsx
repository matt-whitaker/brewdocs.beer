import {useCallback, useMemo} from "react";
import {ToggleFn} from "@/hooks/useJsonEdit";
import {ChecklistItem} from "@/model/batch";
import {saveSession, useSession} from "@/state/session";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import ChecklistsItem from "@/screen/checklists/item";

export type ChecklistsListProps = {
    list: number;
    items: ChecklistItem[];
    title: string;
    toggle: ToggleFn
}

/**
 * One checklist as its own DataGrid — the grid boundary is what scopes the
 * header's collapse to this list's rows (same pattern as the shopping groups).
 */
export default function ChecklistsList({ list, items, title, toggle }: ChecklistsListProps) {
    const session = useSession();
    const sessionKey = `checklist.${title.toLowerCase()}`;

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    const listItems = useMemo(() => items.map(({ name, completed }, row) => (
        <ChecklistsItem
            key={`${title}-${name}`}
            list={list}
            row={row}
            title={title}
            name={name}
            completed={completed}
            toggle={toggle} />
    )), [items, list, title, toggle]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                label={title}
                // remembered state wins; otherwise a finished list starts folded
                defaultCollapsed={(session?.[sessionKey] as boolean|undefined) ?? items.every(({ completed }) => completed)}
                onToggle={onToggleCollapsed}>
                {title}
            </DataGridHeaderRow>
            {listItems}
        </DataGrid>
    );
}
