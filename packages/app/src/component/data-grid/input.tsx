import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {useCallback} from "react";
import TextInput from "../form/text-input";

export type DataGridInputProps<T> = {
    col: number;
    readonly?: boolean;
    value: string;
    update: (value: string) => void;
}
export default function DataGridInput<T>({ col, readonly = false, value, update }: DataGridInputProps<T>) {
    const onChange = useCallback((newValue: string) => update(newValue), [update]);
    return (
        <TextInput
            readonly={readonly}
            className={classNames(
                VALUE_COL_STARTS[col - 1],
                "self-center px-1.5 lg:px-2.5 col-span-1 input input-bordered lg:input-sm input-xs text-right placeholder:text-right")}
            value={value}
            onChange={onChange} />
    )
}