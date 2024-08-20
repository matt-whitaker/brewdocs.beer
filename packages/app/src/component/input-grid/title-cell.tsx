import {useCallback} from "react";
import {PropsWithOnChange} from "@brewdocs.beer/core";
import {eventValue} from "@/utils/fn";

export type TitleCellProps = Partial<PropsWithOnChange<string>> & {
    value: string;
}

export default function TitleCell({ value, onChange }: TitleCellProps) {
    const _onChange = onChange ? useCallback(eventValue(onChange), [onChange]) : void 0;

    return _onChange
        ? <input
            title={value}
            type="text"
            className="whitespace-nowrap leading-8 input sm:input-md input-xs input-ghost col-span-3"
            onChange={_onChange}
            value={value} />
        : <span className="text-sm whitespace-nowrap leading-8 ml-4 col-span-3">{value}</span>
}