import {useCallback} from "react";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core"
import {eventValue} from "@brewdocs.beer/core";
import classNames from "classnames";

export type InputDateProps = PropsWithClass & PropsWithOnChange<string> & {
    value: string;
    readonly?: boolean;
    placeholder?: string;
    name?: string
    primary?: boolean;
    align?: "left"|"center"|"right";
}
export function InputDate({ className, onChange, value, readonly, placeholder, name, primary, align }: InputDateProps) {
    const optionalProps = onChange ? { onChange: useCallback(eventValue(onChange), [onChange]) } : {};

    return <input
        name={name ?? void 0}
        placeholder={placeholder ?? "MM/DD/YYYY"}
        readOnly={!!readonly}
        value={value}
        type="date"
        className={classNames(
            "input input-bordered lg:input-sm input-xs px-1.5 lg:px-2.5",
            [className],
            {
                "input-primary": primary,
                "text-right": align === "right",
                "placeholder:text-right": align === "right"
            }
        )}
        {...optionalProps } />;
}