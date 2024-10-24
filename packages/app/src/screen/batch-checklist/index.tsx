"use client";

import Screen from "../../component/screen";
import {ScreenH1} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Error from "@/component/error";
import Checklist from "../../component/checklist";
import ChecklistItem from "@/component/checklist/item";
import useChecklist from "@/component/checklist/useChecklist";
import Collapse from "@/component/collapse";
import {ChecklistData} from "@/model/checklist-data";
import sessionState, {Session} from "@/state/session";

export type BatchChecklistProps = {
    batch: Batch;
    session: Session;
    onChange: (batch: Batch) => void
};
export default function BatchChecklist({ batch, session, onChange }: BatchChecklistProps) {
    const [data, toggle] = useChecklist(batch, onChange);

    if (!data) { return <Error>'data' missing</Error>; }

    return (
        <Screen className="join join-vertical w-full">
            <ScreenH1 className="mb-2">Equipment Checklist</ScreenH1>
            {data.checklist.map(({ items, name: title }: ChecklistData, i) => (
                <Collapse
                    toggle={(open: boolean) => sessionState.set(`batch-checklist.${title.toLowerCase()}`, open)}
                    key={title}
                    title={title}
                    className="lg:collapse-open"
                    openInitial={session[`batch-checklist.${title.toLowerCase()}`] ?? true}>
                    <Checklist className="sm:columns-2">
                        {items.map(({ name, checked }, j) => (
                            <ChecklistItem
                                key={`${title}-${name}`}
                                name={`${title}-${name}`}
                                checked={checked}
                                onToggle={() => toggle(`checklist.[${i}].items.[${j}].checked`)}>
                                {name}
                            </ChecklistItem>
                        ))}
                    </Checklist>
                </Collapse>
            ))}
        </Screen>
    )
}