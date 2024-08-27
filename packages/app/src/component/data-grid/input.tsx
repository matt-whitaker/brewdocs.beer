import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {useCallback, useMemo} from "react";
import {eventValue} from "@/utils/fn";
import {UpdateFn} from "@/component/data-grid/useDataGrid";
import TextInput from "../form/text-input";
import {get} from "lodash";

export type DataGridInputProps<T> = { col: number; readonly?: boolean; data: T; dot: string; update: UpdateFn }
export default function DataGridInput<T>({ col, readonly = false, data, dot, update }: DataGridInputProps<T>) {
    const onChange = useCallback((newValue: string) => update(dot, newValue), [dot, update]);
    const value = useMemo(() => get(data, dot), [data, dot]);
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