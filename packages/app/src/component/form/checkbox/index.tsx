import {PropsWithClass} from "../../../../../core";
import classNames from "classnames";
import {PropsWithChildren, useCallback} from "react";
import {eventValue} from "@/utils/fn";

export type CheckboxProps = PropsWithClass & PropsWithChildren & {
    onChange: () => void;
    checked: boolean;
    readonly?: boolean;
    placeholder?: string;
    name?: string
    cbClassName?: string;
};
export default function FormCheckbox({ children, onChange, checked, readonly, placeholder, name, className, cbClassName }: CheckboxProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);

    return (
        <label className={classNames("flex items-center text-sm py-1 text-right justify-end mr-1", [className])}>
            {children}
            <input
                name={name ?? void 0}
                placeholder={placeholder ?? void 0}
                readOnly={!!readonly}
                checked={checked}
                onChange={_onChange}
                type="checkbox"
                className={classNames("ml-2 checkbox checkbox-sm", [cbClassName])} />
        </label>
    );
}