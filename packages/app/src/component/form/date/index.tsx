import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {useCallback} from "react";
import {eventValue} from "@/utils/fn";

export type DateInputProps = PropsWithClass & { onChange: (value: string) => void; value: string; readonly?: boolean; placeholder?: string; name?: string }
export default function FormDate({ className, onChange, value, readonly, placeholder, name }: DateInputProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);
    return <input
        name={name ?? void 0}
        placeholder={"MM/DD/YYYY"}
        readOnly={!!readonly}
        value={value}
        onChange={_onChange}
        type="date"
        className={classNames("input input-bordered lg:input-sm input-xs", [className])} />;
}