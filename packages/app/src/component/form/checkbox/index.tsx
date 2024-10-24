import {PropsWithClass} from "../../../../../core";
import classNames from "classnames";
import {PropsWithChildren, useCallback} from "react";
import {eventValue} from "@brewdocs.beer/core";

export type CheckboxProps = PropsWithClass & PropsWithChildren & {
    onChange: () => void;
    checked: boolean;
    readonly?: boolean;
    name?: string
    cbClassName?: string;
};
export default function FormCheckbox({ children, onChange, checked, readonly, name, className, cbClassName }: CheckboxProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);

    return (
        <label className={classNames("flex items-center text-sm py-1 text-right justify-end mr-1", [className])}>
            {children}
            <input
                name={name ?? void 0}
                readOnly={!!readonly}
                checked={checked}
                onChange={_onChange}
                type="checkbox"
                className={classNames("ml-2 checkbox checkbox-sm", [cbClassName])} />
        </label>
    );
}