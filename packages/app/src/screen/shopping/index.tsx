"use client";

import Error from "@/component/error";
import Batch from "@/model/batch";
import {ScreenH2, ScreenH3} from "@/component/typography";
import Screen from "@/component/screen";
import ButtonChecklistItem from "@/component/button-checklist/item";
import ButtonChecklistAdd from "@/component/button-checklist/add";
import ButtonChecklist from "@/component/button-checklist";

export default function Shopping({ batch }: { batch: Batch }) {
    const recipe = batch?.recipe;
    if (!recipe) return <Error>'recipe' missing</Error>

    return (
        <Screen>
            <ScreenH2>Shopping List</ScreenH2>
            <div className="mt-3 flex grid grid-cols-1 lg:grid-cols-3 gap-x-4">
                <div>
                    <ScreenH3>Hops</ScreenH3>
                    {/*<ButtonChecklist className="sm:columns-2">*/}
                    {/*    {items.map(({ name, checked }, j) => (*/}
                    {/*        <ButtonChecklistItem*/}
                    {/*            key={`${title}-${name}`}*/}
                    {/*            name={`${title}-${name}`}*/}
                    {/*            checked={checked}*/}
                    {/*            onToggle={() => toggle(`checklist.[${i}].items.[${j}].checked`)}*/}
                    {/*            onRemove={() => remove(`checklist.[${i}].items`, j)}>*/}
                    {/*            {name}*/}
                    {/*        </ButtonChecklistItem>*/}
                    {/*    ))}*/}
                    {/*    <ButtonChecklistAdd*/}
                    {/*        add={(value: string) => add(`checklist.[${i}].items`, value)}*/}
                    {/*        disallow={items.map(({ name }) => name)} />*/}
                    {/*</ButtonChecklist>*/}
                    {/*<ul className="w-full flex flex-col">*/}
                    {/*    {batch.hops.map(({ name }) => (*/}
                    {/*        <label key={name} className="mb-0.5 text-lg flex items-center">*/}
                    {/*            <input type="checkbox" className="checkbox sm:checkbox-sm checkbox-xs mr-3" />*/}
                    {/*            {name}*/}
                    {/*        </label>*/}
                    {/*    ))}*/}
                    {/*</ul>*/}
                </div>
            </div>
        </Screen>
    );
}