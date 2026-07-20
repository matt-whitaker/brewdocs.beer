import Screen from "../../component/screen";
import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import useJsonEdit from "@/hooks/useJsonEdit";
import {useBatch} from "@/state/batches";
import ChecklistsList from "@/screen/checklists/list";
import {useMemo} from "react";

export type BatchChecklistProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function Checklists({ batchId, onChange }: BatchChecklistProps) {
    const batch = useBatch(batchId);
    const [data, , , toggle] = useJsonEdit(batch, onChange);

    const checklists = useMemo(() => data.checklists.map(({ items, name: title }, i) => (
        <ChecklistsList key={title} list={i} items={items} title={title} toggle={toggle} />
    )), [data.checklists, toggle])

    return (
        <Screen>
            <ScreenH1 className="mb-2">Equipment Checklist</ScreenH1>
            {checklists}
        </Screen>
    )
}