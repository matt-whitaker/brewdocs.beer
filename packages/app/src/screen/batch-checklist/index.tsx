"use client";

import Screen from "../../component/screen";
import {ScreenH1} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import Checklist from "../../component/checklist";
import ChecklistItem from "@/component/checklist/item";
import useChecklist from "@/component/checklist/useChecklist";
import Collapse from "@/component/collapse";
import {ChecklistData} from "@/model/checklist-data";
import ChecklistAdd from "@/component/checklist/add";

export default function BatchChecklist({ batch, onChange }: { batch: Batch; onChange: (batch: Batch) => void }) {
    const [data, toggle, add, remove] = useChecklist(batch, onChange);

    if (!data) { return <Error>'batch' missing</Error>; }

    return (
        <Screen className="join join-vertical w-full">
            <ScreenH1 className="mb-2">Equipment Checklist</ScreenH1>
            {data.checklist.map(({ items, name: title }: ChecklistData, i) => (
                <Collapse
                    key={title}
                    title={title}
                    className="lg:collapse-open"
                    openInitial={items.some(({ checked }) => checked)}>
                    <Checklist className="sm:columns-2">
                        {items.map(({ name, checked }, j) => (
                            <ChecklistItem
                                key={`${title}-${name}`}
                                name={`${title}-${name}`}
                                checked={checked}
                                onToggle={() => toggle(`checklist.[${i}].items.[${j}].checked`)}
                                onRemove={() => remove(`checklist.[${i}].items`, j)}>
                                {name}
                            </ChecklistItem>
                        ))}
                        <ChecklistAdd
                            add={(value: string) => add(`checklist.[${i}].items`, value)}
                            disallow={items.map(({ name }) => name)} />
                    </Checklist>
                </Collapse>
            ))}
        </Screen>
    )
}