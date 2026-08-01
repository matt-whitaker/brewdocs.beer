import classNames from "classnames";
import {useCallback} from "react";
import {PropsWithClass, PropsWithOnBlur, PropsWithOnChange, eventValue} from "@brewdocs.beer/core";

export type TextareaProps = PropsWithClass
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
        size?: "small"|"medium"|"large";
    };
export function Textarea({ className, onChange, onBlur, value, readonly, placeholder, name, label, primary, size }: TextareaProps) {
    const handleChange = useCallback(eventValue((v: string) => onChange?.(v)), [onChange]);
    const handleBlur = useCallback(eventValue((v: string) => onBlur?.(v)), [onBlur]);
    const optionalProps  = {
        onChange: onChange ? handleChange : void 0,
        onBlur: onBlur ? handleBlur : void 0
    };
    return <textarea
        name={name ?? void 0}
        aria-label={label ?? void 0}
        placeholder={placeholder!}
        readOnly={!!readonly}
        value={value}
        className={classNames(
            "textarea w-full",
            {
                "textarea-xs lg:textarea-sm": size === "small",
                "textarea-sm lg:textarea-md": !size || size === "medium",
                "textarea-md lg:textarea-lg": size === "large",
            },
            [className],
            {
                "textarea-primary": primary
            }
        )}
        {...optionalProps} />;
}
