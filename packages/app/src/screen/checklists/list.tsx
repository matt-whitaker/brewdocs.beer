import {saveSession, useSession} from "@/state/session";
import Checklist from "@/component/checklist";
import Collapse from "@/component/collapse";
import {ToggleFn} from "@/hooks/useJsonEdit";
import ChecklistsItem from "@/screen/checklists/item";
import {useCallback, useMemo} from "react";
import {ChecklistItem} from "@/model/batch";

export type ChecklistsListProps = {
    list: number;
    items: ChecklistItem[];
    title: string;
    toggle: ToggleFn
}
export default function ChecklistsList({ list, items, title, toggle }: ChecklistsListProps) {
    const session = useSession();

    const toggleChecklist = useCallback((open: boolean) => saveSession(`checklist.${title.toLowerCase()}`, open), [title]);

    const listItems = useMemo(() => items.map(({ name, completed }, j) => (
        <ChecklistsItem key={`${title}-${name}`} list={list} row={j} title={title} name={name} completed={completed} toggle={toggle} />
    )), [items, title, toggle])

    return (
        <Collapse
            toggle={toggleChecklist}
            title={title}
            className="lg:collapse-open"
            openInitial={session?.[`checklist.${title.toLowerCase()}`] ?? !items.every(({ completed }) => completed)}>
            <Checklist className="sm:columns-2">
                {listItems}
            </Checklist>
        </Collapse>
    )
}