import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type InputSelectOption = { name: string; value: string }
export type InputSelectProps = PropsWithClass & { value: string; data: InputSelectOption[] }
export function InputSelect({ data, value, className }: InputSelectProps) {
    return (
        <select className={classNames("select select-xs select-bordered", [className])} value={value}>
            {data.map((({ name, value }, i) => <option key={`${value}-${i}`} value={value}>{name}</option>))}
        </select>
    );
}