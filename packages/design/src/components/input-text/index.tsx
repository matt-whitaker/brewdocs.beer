import classNames from "classnames";
import {PropsWithClass, PropsWithOnChange, eventValue, PropsWithOnBlur} from "@brewdocs.beer/core"
import {useCallback} from "react";

export type InputTextProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
    value: string;
    readonly?: boolean;
    placeholder?: string;
    name?: string
    primary?: boolean;
    align?: "left"|"center"|"right";
}
export function InputText({ className, onChange, onBlur, value, readonly, placeholder, name, primary, align }: InputTextProps) {
    const optionalProps  = {
        onChange: onChange ? useCallback(eventValue(onChange), [onChange]) : void 0,
        onBlur: onBlur ? useCallback(eventValue(onBlur), [onBlur]) : void 0
    };
    return <input
        name={name ?? void 0}
        placeholder={placeholder!}
        readOnly={!!readonly}
        value={value}
        type="text"
        className={classNames(
            "input input-bordered lg:input-sm input-xs px-1 lg:px-2.5",
            [className],
            {
                "input-primary": primary,
                "text-right": align === "right",
                "placeholder:text-right": align === "right"
            }
        )}
        {...optionalProps} />;
}