import Screen from "../../component/screen";
import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Checklist from "../../component/checklist";
import ChecklistItem from "@/component/checklist/item";
import useJsonEdit from "@/hooks/useJsonEdit";
import Collapse from "@/component/collapse";
import {saveSession, useSession} from "@/state/session";
import {useBatch} from "@/state/batches";

export type BatchChecklistProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function Checklists({ batchId, onChange }: BatchChecklistProps) {
    const session = useSession();
    const batch = useBatch(batchId);
    const [data, , , toggle] = useJsonEdit(batch, onChange);

    return (
        <Screen className="join join-vertical w-full">
            <ScreenH1 className="mb-2">Equipment Checklist</ScreenH1>
            {data.checklists.map(({ items, name: title }, i) => (
                <Collapse
                    toggle={(open: boolean) => saveSession(`checklist.${title.toLowerCase()}`, open)}
                    key={title}
                    title={title}
                    className="lg:collapse-open"
                    openInitial={session?.[`checklist.${title.toLowerCase()}`] ?? !items.every(({ completed }) => completed)}>
                    <Checklist className="sm:columns-2">
                        {items.map(({ name, completed }, j) => (
                            <ChecklistItem
                                key={`${title}-${name}`}
                                name={`${title}-${name}`}
                                checked={completed}
                                onToggle={() => toggle(`checklists.[${i}].items.[${j}].completed`)}>
                                {name}
                            </ChecklistItem>
                        ))}
                    </Checklist>
                </Collapse>
            ))}
        </Screen>
    )
}