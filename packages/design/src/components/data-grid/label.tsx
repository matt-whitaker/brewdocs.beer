import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {COL_SPANS} from "./styles";

// The trailing variants shrink the label when it sits in a data-grid nested
// inside another data-grid (an expanded body); text-2xs (theme token) matches
// daisyui's select-xs/input-xs font size so it lines up with the xs controls.
const LABEL_CLASS = "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer [.data-grid_.data-grid_&]:pl-3";
const TINY = "[.data-grid_.data-grid_&]:text-2xs ml-6 border-l border-solid border-transparent";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & {
    htmlFor?: string;
    tiny?: boolean;
    /** columns to span within the row */
    cols?: number;
};
export function DataGridLabel({ children, className, htmlFor, tiny = false, cols = 4 }: DataGridLabelProps) {
    const classes = classNames(LABEL_CLASS, COL_SPANS[cols - 1], [className], { [TINY]: tiny });

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
