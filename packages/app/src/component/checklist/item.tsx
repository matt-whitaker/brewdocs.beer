import {PropsWithChildren } from "react";
import {Trash} from "@/component/svg";

export type ChecklistItemProps = PropsWithChildren & {
    name: string;
    checked: boolean;
    onToggle: () => void;
    onRemove: () => void;
}
export default function ChecklistItem({ name, onToggle, onRemove, checked, children }: ChecklistItemProps) {

    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost relative lg:[&:hover>div]:flex">
            <div onClick={onRemove} className="absolute lg:right-3 right-2 items-center lg:hidden flex h-full hover:cursor-pointer">
                <Trash className="w-4 stroke-red-800 z-50" />
            </div>
            <label htmlFor={name} key={name} className="ml-3 font-normal justify-start hover:cursor-pointer flex items-center">
                <input id={name} value={name} onChange={onToggle} type="checkbox" checked={checked} className="checkbox checkbox-xs mr-2" />
                {children}
            </label>
        </li>
    );
}