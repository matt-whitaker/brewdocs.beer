import {PropsWithChildren, ReactNode, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";
import {Chevron} from "@/component/svg";
import {CHEVRON, CHEVRON_ICON} from "@/component/data-grid";

const ZEBRA = "odd:bg-base-200";
const ROW_CONTAINER = "relative py-1 px-1 [.data-grid_.data-grid_&]:p-0";
const ROW_GRID = "grid grid-cols-6 gap-x-1 leading-3 align-middle";

export type DataGridRowProps = PropsWithClass & PropsWithChildren & {
    /** optional secondary config revealed under the row — expected to be its own <DataGrid> */
    expandContent?: ReactNode;
    /** accessible label for the expand toggle, e.g. "hop details" */
    label?: string;

    zebra?: boolean;
};

export default function DataGridRow({ children, className, expandContent, label, zebra = false }: DataGridRowProps) {
    const [expanded, setExpanded] = useState(false);

    // no expandContent → the row is simply the grid (unchanged, backward compatible)
    if (!expandContent) {
        return <div className={classNames(ROW_CONTAINER, ROW_GRID, [className], { [ZEBRA]: zebra })}>{children}</div>;
    }

    return (
        <div className={classNames(ROW_CONTAINER, [className], { [ZEBRA]: zebra })}>
            <div className="flex items-start gap-x-1">
                <div className="flex-1 min-w-0">
                    <div className={ROW_GRID}>{children}</div>
                    {expanded && expandContent}
                </div>
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Hide" : "Show"} ${label ?? "details"}`}
                    onClick={() => setExpanded(prev => !prev)}
                    className={CHEVRON}
                >
                    <Chevron className={classNames(CHEVRON_ICON, {"rotate-180": expanded})} />
                </button>
            </div>
        </div>
    );
}
