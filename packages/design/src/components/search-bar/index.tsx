import classNames from "classnames";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {InputText} from "@/components/input-text";

export type SearchBarProps = PropsWithClass
    & PropsWithOnChange<string>
    & {
        value: string;
        placeholder?: string;

        label?: string;
    };

export function SearchBar({ value, onChange, placeholder = "Search…", label, className }: SearchBarProps) {
    return <InputText
        value={value}
        size="medium"
        onChange={onChange}
        placeholder={placeholder}
        label={label}
        className={classNames("w-full", className)} />;
}
