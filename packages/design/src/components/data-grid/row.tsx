import classNames from "classnames";
import {PropsWithChildren, ReactNode, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {Chevron} from "@/components/svg";
import {CHEVRON, CHEVRON_ICON} from "./styles";

const ZEBRA = "odd:bg-base-200";
const ROW_CONTAINER = "relative py-1 px-1 [.data-grid_.data-grid_&]:p-0";
const ROW_GRID = "grid grid-cols-6 gap-x-1 leading-3 align-middle";

export type DataGridRowProps = PropsWithClass & PropsWithChildren & {
    /** optional secondary config revealed under the row — expected to be its own <DataGrid> */
    expandContent?: ReactNode;
    /** accessible label for the expand toggle, e.g. "hop details" */
    label?: string;
    /**
     * Reserve the expander's column on a row that has no `expandContent`, so its
     * grid gets the same width as sibling rows that do have one.
     *
     * Without it, an expandable row's grid is squeezed into `flex-1` beside the
     * chevron while a plain row's grid spans the full width — so the two don't
     * line up. Set this on the plain rows of any list that contains at least one
     * expandable row (BatchPlanning's grains/yeasts alongside hops, say).
     */
    reserveExpand?: boolean;

    zebra?: boolean;
};

export function DataGridRow({ children, className, expandContent, label, reserveExpand = false, zebra = false }: DataGridRowProps) {
    const [expanded, setExpanded] = useState(false);

    // neither an expander nor a reservation → the row is simply the grid
    if (!expandContent && !reserveExpand) {
        return <div className={classNames(ROW_CONTAINER, ROW_GRID, [className], { [ZEBRA]: zebra })}>{children}</div>;
    }

    return (
        <div className={classNames(ROW_CONTAINER, [className], { [ZEBRA]: zebra })}>
            <div className="flex items-start gap-x-1">
                <div className="flex-1 min-w-0">
                    <div className={ROW_GRID}>{children}</div>
                    {expanded && expandContent}
                </div>
                {expandContent ? (
                    <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Hide" : "Show"} ${label ?? "details"}`}
                        onClick={() => setExpanded(prev => !prev)}
                        className={CHEVRON}
                    >
                        <Chevron className={classNames(CHEVRON_ICON, {"rotate-180": expanded})} />
                    </button>
                ) : (
                    // the *same* CHEVRON classes, deliberately: btn-square sizes the
                    // box from --size rather than its contents, so an empty span is
                    // pixel-identical to the button. A hand-sized spacer drifts.
                    <span className={classNames(CHEVRON, "pointer-events-none")} aria-hidden="true" />
                )}
            </div>
        </div>
    );
}
