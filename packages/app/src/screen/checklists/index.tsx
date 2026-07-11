import Screen from "../../component/screen";
import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Error from "@/component/error";
import Checklist from "../../component/checklist";
import ChecklistItem from "@/component/checklist/item";
import useChecklist from "@/component/checklist/useChecklist";
import Collapse from "@/component/collapse";
import {saveSession, useSession} from "@/state/session";
import {useSuspenseBatch} from "@/state/batches";

export type BatchChecklistProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function Checklists({ batchId, onChange }: BatchChecklistProps) {
    const session = useSession();
    const batch = useSuspenseBatch(batchId);
    const [data, toggle] = useChecklist(batch, onChange);

    if (!data) { return <Error>'data' missing</Error>; }

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