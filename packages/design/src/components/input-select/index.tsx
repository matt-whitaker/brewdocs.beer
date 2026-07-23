import classNames from "classnames";
import {useCallback} from "react";
import {PropsWithClass, PropsWithOnChange, eventValue} from "@brewdocs.beer/core";

export type InputSelectOption = { name: string; value?: string };
export type InputSelectProps = PropsWithClass
    & PropsWithOnChange<string>
    & {
        allowNull?: boolean;
        value: string|null;
        data: InputSelectOption[]
    };
export function InputSelect({ data, value, className, onChange, allowNull = false }: InputSelectProps) {
    const handleChange = useCallback(eventValue((v: string) => onChange?.(v)), [onChange]);
    const optionalProps = onChange ? { onChange: handleChange } : {};
    return (
        <select className={classNames("select select-xs", [className])} value={value ?? ""} {...optionalProps}>
            {allowNull ? <option key="null">-- Select --</option> : null}
            {data.map(((datum, i) => <option key={`${datum.value}-${i}`} value={datum.value || datum.name}>{datum.name}</option>))}
        </select>
    );
}