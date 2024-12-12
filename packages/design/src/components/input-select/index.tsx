import classNames from "classnames";
import {eventValue, PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {useCallback} from "react";

export type InputSelectOption = { name: string; value?: string }
export type InputSelectProps = PropsWithClass
    & PropsWithOnChange<string>
    & {
        allowNull?: boolean;
        value: string|null;
        data: InputSelectOption[]
    }
export function InputSelect({ data, value, className, onChange, allowNull = false }: InputSelectProps) {
    const optionalProps = onChange ? { onChange: useCallback(eventValue(onChange), [onChange]) } : {}
    return (
        <select className={classNames("select select-xs select-bordered", [className])} value={value ?? ""} {...optionalProps}>
            {allowNull ? <option key="null">-- Select --</option> : null}
            {data.map(((datum, i) => <option key={`${datum.value}-${i}`} value={datum.value || datum.name}>{datum.name}</option>))}
        </select>
    );
}