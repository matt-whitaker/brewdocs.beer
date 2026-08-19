import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {COL_SPANS, COL_STARTS, GridColumn} from "./styles";

const LABEL_CLASS = "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer [.data-grid_.data-grid_&]:pl-3";
const TINY = "[.data-grid_.data-grid_&]:text-2xs ml-6 border-l border-solid border-transparent";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & {
    htmlFor?: string;
    tiny?: boolean;

    cols?: GridColumn;

    colStart?: GridColumn;
};
export function DataGridLabel({ children, className, htmlFor, tiny = false, cols = 4, colStart }: DataGridLabelProps) {
    const classes = classNames(LABEL_CLASS, colStart && COL_STARTS[colStart - 1], COL_SPANS[cols - 1], [className], { [TINY]: tiny });

    if (htmlFor) {
        return (
            <label htmlFor={htmlFor} className={classes}>
                {children}
            </label>
        );
    }
    return (
        <div className={classes}>
            {children}
        </div>
    );
}
