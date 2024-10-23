import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {useCallback} from "react";
import TextInput from "../form/text";
import {PropsWithClass} from "@brewdocs.beer/core";
import FormDate from "../form/date";

export type DataGridInputProps = {
    col: number;
    readonly?: boolean;
    value: string;
    update?: (value: string) => void;
    type?: "text"|"number"|"date"
} & PropsWithClass
export default function DataGridInput({ col, readonly = false, value, update, className, type }: DataGridInputProps) {
    const onChange = useCallback((newValue: string) => update?.(newValue), [update]);

    if (type === "date") {
        return (
            <FormDate
                readonly={readonly}
                className={classNames(
                    VALUE_COL_STARTS[col - 1],
                    "self-center px-1.5 lg:px-2.5 col-span-1 text-right placeholder:text-right",
                    [className],
                    { "input-primary": !readonly })}
                onChange={onChange}
                value={value} />
        )
    }

    return (
        <TextInput
            readonly={readonly}
            className={classNames(
                VALUE_COL_STARTS[col - 1],
                "self-center px-1.5 lg:px-2.5 col-span-1 text-right placeholder:text-right",
                [className],
                { "input-primary": !readonly })}
            value={value}
            onChange={onChange} />
    )
}