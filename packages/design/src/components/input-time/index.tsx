import classNames from "classnames";
import {useCallback} from "react";
import {PropsWithClass, PropsWithOnChange, eventValue} from "@brewdocs.beer/core";

export type InputTimeProps = PropsWithClass & PropsWithOnChange<string> & {
    value: string;
    readonly?: boolean;
    placeholder?: string;
    name?: string

    label?: string;
    primary?: boolean;
    align?: "left"|"center"|"right";
};
export function InputTime({ className, onChange, value, readonly, placeholder, name, label, primary, align }: InputTimeProps) {
    const handleChange = useCallback(eventValue((v: string) => onChange?.(v)), [onChange]);
    const optionalProps = onChange ? { onChange: handleChange } : {};

    return <input
        name={name ?? void 0}
        aria-label={label ?? void 0}
        placeholder={placeholder ?? "HH:MM"}
        readOnly={!!readonly}
        value={value}
        type="time"
        className={classNames(
            "input lg:input-sm input-xs px-1.5 lg:px-2.5",
            [className],
            {
                "input-primary": primary,
                "text-right": align === "right",
                "placeholder:text-right": align === "right"
            }
        )}
        {...optionalProps } />;
}
