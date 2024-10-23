import {Plus} from "@/component/svg";
import TextInput from "../form/text";
import { useState} from "react";

export type ChecklistAddProps<T> = { add: (value: string) => void; disallow: string[] }
export default function ChecklistAdd<T>({ add, disallow }: ChecklistAddProps<T>) {
    const [state, setState] = useState("");
    return (
        <li className="pl-1 w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost flex items-center flex-grow pr-1 leading-8">
            <label
                onClick={() => {
                    if (state && !disallow.includes(state)) {
                        add(state);
                        setState("");
                    }
                }}
                className="font-normal justify-start hover:cursor-pointer p-2 mb-0.5 text-lg flex items-center">
                <Plus className="stroke-primary w-4" />
            </label>
            <TextInput
                placeholder="Add additional items"
                value={state}
                onChange={setState}
                className="lg:input-xs lg:input-primary input-ghost flex-grow ml-2 outline-0" />
        </li>
    )
}