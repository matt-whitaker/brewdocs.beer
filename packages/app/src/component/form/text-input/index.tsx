import classNames from "classnames";
import {PropsWithClass} from "../../../../../core/src";
import {useCallback} from "react";
import {eventValue} from "@/utils/fn";

export type TextInputProps = PropsWithClass & { onChange: (value: string) => void; value: string; readonly?: boolean; placeholder?: string; name?: string }
export default function TextInput({ className, onChange, value, readonly, placeholder, name }: TextInputProps) {
    const _onChange = useCallback(eventValue(onChange), [onChange]);
    return <input
        name={name ?? void 0}
        placeholder={placeholder ?? void 0}
        readOnly={!!readonly}
        value={value}
        onChange={_onChange}
        type="text"
        className={classNames([className])} />;
}