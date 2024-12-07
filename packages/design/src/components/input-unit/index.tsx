import { PropsWithOnChange} from "@brewdocs.beer/core"
import {InputText, InputTextProps} from "../input-text";
import {useCallback} from "react";

export type InputUnitProps = Omit<InputTextProps, "onBlur"|"onChange">
    & PropsWithOnChange<string>
    & {
    unit: "string"
}
export function InputUnit({ unit, onChange, ...inputTextProps }: InputUnitProps) {
    const _onBlur = useCallback((value: string) => {

    }, []);
    return <InputText {...inputTextProps} />;
}