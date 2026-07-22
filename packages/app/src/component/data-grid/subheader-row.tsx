import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

/**
 * A second-level heading inside a DataGrid section — labels a run of rows
 * beneath a DataGridHeaderRow (e.g. a mash step, or "Additives"). Quieter than
 * the header and not collapsible; it's a label, not a control.
 *
 * As a sibling it sits under the header's collapse rule, so it hides along with
 * the rows it labels.
 */
export default function DataGridSubheaderRow({ children, className }: PropsWithChildren & PropsWithClass) {
    return (
        <div className={classNames("px-1 pt-2 pb-1 text-xs font-medium text-base-content/70", [className])}>
            {children}
        </div>
    );
}
