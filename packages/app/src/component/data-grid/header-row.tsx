import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

/**
 * A group heading inside a DataGrid — used when a sort implies groupings
 * (e.g. shopping sorted by type). Spans the full row rather than the 6-col
 * grid, since it labels the rows beneath it rather than aligning with them.
 */
export default function DataGridHeaderRow({ children, className }: PropsWithChildren & PropsWithClass) {
    return (
        <div className={classNames(
            "px-1 pt-3 pb-1 text-2xs uppercase tracking-wide font-semibold text-base-content/60",
            [className]
        )}>
            {children}
        </div>
    );
}
