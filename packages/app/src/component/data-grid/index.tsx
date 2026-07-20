import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

/**
 * Column spans a row child can claim, indexed by `cols - 1`. Written out in
 * full because tailwind only generates classes it can see literally — a
 * `col-span-${n}` template would compile to nothing.
 */
export const COL_SPANS = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6"];

export default function DataGrid({ children, className }: PropsWithChildren & PropsWithClass) {
    return (
        <div className={classNames("flex flex-col data-grid [.data-grid_&]:pt-1", [className])}>{children}</div>
    );
}
