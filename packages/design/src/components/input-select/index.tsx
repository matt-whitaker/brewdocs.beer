import classNames from "classnames";
import {eventValue, PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {useCallback} from "react";

export type InputSelectOption = { name: string; value: string }
export type InputSelectProps = PropsWithClass & PropsWithOnChange<string> & { value: string; data: InputSelectOption[] }
export function InputSelect({ data, value, className, onChange }: InputSelectProps) {
    const optionalProps = onChange ? { onChange: useCallback(eventValue(onChange), [onChange]) } : {}
    return (
        <select className={classNames("select select-xs select-bordered", [className])} value={value} {...optionalProps}>
            {data.map((({ name, value }, i) => <option key={`${value}-${i}`} value={value}>{name}</option>))}
        </select>
    );
}