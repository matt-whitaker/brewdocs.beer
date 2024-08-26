import {Plus} from "@/component/svg";
import TextInput from "../form/text-input";

export type ButtonChecklistAddProps = {}
export default function ButtonChecklistAdd({}: ButtonChecklistAddProps) {
    return (
        <li className="pl-1 w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost flex items-center flex-grow pr-1">
            <label className="font-normal justify-start hover:cursor-pointer btn btn-ghost lg:btn-md btn-xs mb-0.5 text-lg flex items-center">
                <Plus className="stroke-primary lg:w-6 w-4" />
            </label>
            <TextInput value="" onChange={() => {  }} className="input lg:input-sm input-xs lg:input-primary max-lg:input-ghost flex-grow ml-2 outline-0" />
        </li>
    )
}