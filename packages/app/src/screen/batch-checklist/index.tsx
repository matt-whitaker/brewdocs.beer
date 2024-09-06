"use client";

import Screen from "../../component/screen";
import {ScreenH2} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import ButtonChecklist from "@/component/button-checklist";
import ButtonChecklistItem from "@/component/button-checklist/item";
import useButtonChecklist from "@/component/button-checklist/useButtonChecklist";
import Collapse from "@/component/collapse";
import {ChecklistData} from "@/model/checklist-data";
import ButtonChecklistAdd from "@/component/button-checklist/add";

export default function BatchChecklist({ batch, onChange }: { batch: Batch; onChange: (batch: Batch) => void }) {
    const [data, toggle, add, remove] = useButtonChecklist(batch, onChange);

    if (!data) { return <Error>'batch' missing</Error>; }

    return (
        <Screen className="join join-vertical w-full">
            <ScreenH2>Brew Day Checklist</ScreenH2>
            {data.checklist.map(({ items, name: title }: ChecklistData, i) => (
                <Collapse key={title} title={title} className="lg:collapse-open">
                    <ButtonChecklist className="sm:columns-2">
                        {items.map(({ name, checked }, j) => (
                            <ButtonChecklistItem
                                key={`${title}-${name}`}
                                name={`${title}-${name}`}
                                checked={checked}
                                onToggle={() => toggle(`checklist.[${i}].items.[${j}].checked`)}
                                onRemove={() => remove(`checklist.[${i}].items`, j)}>
                                {name}
                            </ButtonChecklistItem>
                        ))}
                        <ButtonChecklistAdd
                            add={(value: string) => add(`checklist.[${i}].items`, value)}
                            disallow={items.map(({ name }) => name)} />
                    </ButtonChecklist>
                </Collapse>
            ))}
        </Screen>
    )
}