import classNames from "classnames";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {InputText} from "@brewdocs.beer/design";

export type SearchBarProps = PropsWithClass
    & PropsWithOnChange<string>
    & {
        value: string;
        placeholder?: string;
    };

export default function SearchBar({ value, onChange, placeholder = "Search…", className }: SearchBarProps) {
    return <InputText
        value={value}
        size="medium"
        onChange={onChange}
        placeholder={placeholder}
        className={classNames("w-full", className)} />;
}
