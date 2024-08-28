import classNames from "classnames";
import {PropsWithClass} from "../../../../../core/src";
import {useCallback} from "react";
import {eventValue} from "@/utils/fn";

export type TextInputProps = PropsWithClass & { onChange: (value: string) => void; value: string; readonly?: boolean; placeholder?: string }
export default function TextInput({ className, onChange, value, readonly, placeholder }: TextInputProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);
    return <input
        placeholder={placeholder}
        readOnly={!!readonly}
        value={value}
        onChange={_onChange}
        type="text"
        className={classNames([className])} />;
}