import {eventValue} from "@/utils/fn";
import {PropsWithChildren, useCallback, useMemo} from "react";
import {get} from "lodash";
import {Cancel, Trash} from "@/component/svg";

export type ButtonChecklistItemProps<T> = PropsWithChildren & {
    name: string;
    toggleDot: string;
    removeDot: string;
    data: T;
    toggle: (dot: string) => void;
    remove: (dot: string, value: string) => void;
}
export default function ButtonChecklistItem<T>({ name, toggle, remove, toggleDot, removeDot, data, children }: ButtonChecklistItemProps<T>) {
    const onChange = useCallback(() => toggle(toggleDot), [toggleDot, toggle]);
    const onClick = useCallback(() => remove(removeDot, name), [removeDot, name]);
    const checked = useMemo(() => get(data, toggleDot).checked, [data, toggleDot]);

    return (
        <li className="w-full overflow-hidden max-lg:[&>label]:odd:btn-ghost relative lg:[&:hover>div]:flex">
            {/*<div onClick={onClick} className="absolute lg:right-3 right-2 items-center lg:hidden flex h-full hover:cursor-pointer">*/}
            {/*    <Trash className="w-4 stroke-red-800" />*/}
            {/*</div>*/}
            <label htmlFor={name} key={name} className="font-normal justify-start hover:cursor-pointer btn lg:btn-ghost lg:btn-md btn-sm mb-0.5 text-lg flex items-center">
                <input id={name} value={name} onChange={onChange} type="checkbox" checked={checked} className="checkbox lg:checkbox-sm checkbox-xs mr-3" />
                {children}
            </label>
        </li>
    );
}