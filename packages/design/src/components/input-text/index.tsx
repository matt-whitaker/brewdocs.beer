import classNames from "classnames";
import {useCallback} from "react";
import {PropsWithClass, PropsWithOnBlur, PropsWithOnChange, eventValue} from "@brewdocs.beer/core";

export type InputTextProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
        value: string;
        readonly?: boolean;
        placeholder?: string;
        name?: string
        /** accessible name, when no visible <label> is associated — rendered as aria-label */
        label?: string;
        primary?: boolean;
        align?: "left"|"center"|"right";
        size?: "small"|"medium"|"large";
    };
export function InputText({ className, onChange, onBlur, value, readonly, placeholder, name, label, primary, align, size }: InputTextProps) {
    const handleChange = useCallback(eventValue((v: string) => onChange?.(v)), [onChange]);
    const handleBlur = useCallback(eventValue((v: string) => onBlur?.(v)), [onBlur]);
    const optionalProps  = {
        onChange: onChange ? handleChange : void 0,
        onBlur: onBlur ? handleBlur : void 0
    };
    return <input
        name={name ?? void 0}
        aria-label={label ?? void 0}
        placeholder={placeholder!}
        readOnly={!!readonly}
        value={value}
        type="text"
        onKeyDown={onBlur ? ({ key, currentTarget }) => { if (key === "Enter") currentTarget.blur(); } : void 0}
        className={classNames(
            "input  px-1 lg:px-2.5",
            {
                "lg:input-sm input-xs": !size || size === "small",
                "lg:input-md input-sm": !size || size === "medium",
                "lg:input-lg input-md": !size || size === "large",
            },
            [className],
            {
                "input-primary": primary,
                "text-right": align === "right",
                "placeholder:text-right": align === "right"
            }
        )}
        {...optionalProps} />;
}