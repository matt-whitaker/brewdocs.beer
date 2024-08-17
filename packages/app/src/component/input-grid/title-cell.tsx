import {useCallback} from "react";
import {eventValue} from "@/utils";
import {PropsWithOnChange} from "@/component/prop-types";

export type TitleCellProps = Partial<PropsWithOnChange<string>> & {
    value: string;
}

export default function TitleCell({ value, onChange }: TitleCellProps) {
    const _onChange = onChange ? useCallback(eventValue(onChange), [onChange]) : void 0;

    return _onChange
        ? <input
            title={value}
            type="text"
            className="whitespace-nowrap leading-8 input sm:input-md input-sm input-ghost col-span-2"
            onChange={_onChange}
            value={value} />
        : <span className="text-sm whitespace-nowrap leading-8 ml-4 col-span-2">{value}</span>
}