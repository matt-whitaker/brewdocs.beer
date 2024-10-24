import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {InputText} from "@brewdocs.beer/design"
import {PropsWithClass} from "@brewdocs.beer/core";
import {InputDate} from "@brewdocs.beer/design";

export type DataGridInputProps = {
    col: number;
    readonly?: boolean;
    value: string;
    update?: (value: string) => void;
    type?: "text"|"number"|"date"
} & PropsWithClass
export default function DataGridInput({ col, readonly = false, value, update, className, type }: DataGridInputProps) {
    const props = {
        value,
        readonly,
        align: "right",
        primary: !readonly,
        className: classNames(
            VALUE_COL_STARTS[col - 1],
            "self-center col-span-1",
            [className]
        ),
        onChange: update
    }

    if (type === "date") {
        return (
            <InputDate {...props} />
        );
    }

    return (
        <InputText {...props} />
    );
}