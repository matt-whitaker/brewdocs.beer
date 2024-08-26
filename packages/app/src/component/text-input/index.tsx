import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {useCallback} from "react";
import {eventValue} from "@/utils/fn";

export type TextInputProps = PropsWithClass & { onChange: (value: string) => void; value: string; readonly?: boolean }
export default function TextInput({ className, onChange, value, checked, readonly }: TextInputProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);
    return <input
        readOnly={!!readonly}
        value={value}
        onChange={_onChange}
        type="text"
        checked={checked}
        className={classNames([className])} />;
}