import {eventValue} from "@/utils/fn";
import {PropsWithChildren, useCallback} from "react";
import {get} from "lodash";

export type ButtonChecklistItemProps<T> = PropsWithChildren & {
    name: string;
    checked: boolean;
    toggle: (name: string) => void;
}
export default function ButtonChecklistItem<T>({ name, toggle, checked = false, children }: ButtonChecklistItemProps<T>) {
    const onChange = useCallback(eventValue(toggle), [toggle]);

    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost">
            <label htmlFor={name} key={name} className="font-normal justify-start hover:cursor-pointer btn lg:btn-ghost lg:btn-md btn-sm mb-0.5 text-lg flex items-center">
                <input id={name} value={name} onChange={onChange} type="checkbox" checked={checked} className="checkbox lg:checkbox-sm checkbox-xs mr-3" />
                {children}
            </label>
        </li>
    );
}