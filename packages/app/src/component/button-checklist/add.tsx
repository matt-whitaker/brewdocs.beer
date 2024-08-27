import {Plus} from "@/component/svg";
import TextInput from "../form/text-input";
import { useState} from "react";

export type ButtonChecklistAddProps<T> = { add: (value: string) => void; disallow: string[] }
export default function ButtonChecklistAdd<T>({ add, disallow }: ButtonChecklistAddProps<T>) {
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
                className="font-normal justify-start hover:cursor-pointer lg:btn lg:btn-ghost lg:btn-md max-lg:p-2 mb-0.5 text-lg flex items-center">
                <Plus className="stroke-primary lg:w-6 w-4" />
            </label>
            <TextInput value={state} onChange={setState} className="input lg:input-sm input-xs lg:input-primary input-ghost flex-grow ml-2 outline-0" />
        </li>
    )
}