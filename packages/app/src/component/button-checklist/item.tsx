import {PropsWithChildren } from "react";
import {Trash} from "@/component/svg";

export type ButtonChecklistItemProps = PropsWithChildren & {
    name: string;
    checked: boolean;
    onToggle: () => void;
    onRemove: () => void;
}
export default function ButtonChecklistItem({ name, onToggle, onRemove, checked, children }: ButtonChecklistItemProps) {

    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost relative lg:[&:hover>div]:flex">
            <div onClick={onRemove} className="absolute lg:right-3 right-2 items-center lg:hidden flex h-full hover:cursor-pointer">
                <Trash className="w-4 stroke-red-800" />
            </div>
            <label htmlFor={name} key={name} className="font-normal justify-start hover:cursor-pointer btn lg:btn-ghost btn-sm mb-0.5 text-lg flex items-center">
                <input id={name} value={name} onChange={onToggle} type="checkbox" checked={checked} className="checkbox checkbox-xs mr-3" />
                {children}
            </label>
        </li>
    );
}