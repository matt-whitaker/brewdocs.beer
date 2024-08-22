import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {useCallback} from "react";
import {eventValue} from "@/utils/fn";
import {UpdateFn} from "@/component/data-grid/useDataGrid";

export type DataGridInputProps = { col: number; readonly?: boolean; value: string; dot: string; update: UpdateFn }
export default function DataGridInput({ col, readonly = false, value, dot, update }: DataGridInputProps) {
    const onChange = useCallback(eventValue((newValue: string) => update(dot, newValue)), [dot, update])
    return (
        <input
            readOnly={!!readonly}
            type="text"
            className={classNames(
                VALUE_COL_STARTS[col - 1],
                "self-center px-1.5 lg:px-2.5 col-span-1 input input-bordered lg:input-sm input-xs text-right placeholder:text-right")}
            value={value}
            onChange={onChange} />
    )
}