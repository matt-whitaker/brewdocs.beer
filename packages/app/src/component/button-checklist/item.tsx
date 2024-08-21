import {eventValue} from "@/utils/fn";
import {useCallback} from "react";

export type ButtonChecklistItemProps = {
    name: string;
    checked: Record<string, boolean>;
    toggle: (name: string) => void;
}
export default function ButtonChecklistItem({ id, name, checked, toggle, }: ButtonChecklistItemProps) {
    const onChange = useCallback(eventValue(toggle), [toggle]);

    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost">
            <label key={id} className="font-normal justify-start hover:cursor-pointer btn lg:btn-ghost lg:btn-md btn-sm mb-0.5 text-lg flex items-center">
                <input value={id} onChange={onChange} type="checkbox" checked={checked[id]} className="checkbox lg:checkbox-sm checkbox-xs mr-3" />
                {name}
            </label>
        </li>
    );
}