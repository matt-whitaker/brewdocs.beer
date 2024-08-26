import {Plus} from "@/component/svg";
import TextInput from "@/component/text-input";

export type ButtonChecklistAddProps = {}
export default function ButtonChecklistAdd({}: ButtonChecklistAddProps) {
    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost flex items-center flex-grow pr-1">
            <label className="font-normal justify-start hover:cursor-pointer btn lg:btn-ghost lg:btn-md btn-sm mb-0.5 text-lg flex items-center">
                <Plus className="stroke-primary w-6" />
            </label>
            <TextInput value="" onChange={() => {}} className="input input-sm input-primary flex-grow ml-2" />
        </li>
    )
}