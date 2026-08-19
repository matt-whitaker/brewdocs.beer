import classNames from "classnames";
import {PropsWithChildren, ReactNode, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {Chevron} from "@/components/svg";
import {CHEVRON, CHEVRON_ICON} from "./styles";

const ZEBRA = "odd:bg-base-200";
const ROW_CONTAINER = "relative py-1 px-1 [.data-grid_.data-grid_&]:p-0";
const ROW_GRID = "grid grid-cols-6 gap-x-1 leading-3 align-middle";

export type DataGridRowProps = PropsWithClass & PropsWithChildren & {
    expandContent?: ReactNode;

    label?: string;

    reserveExpand?: boolean;

    zebra?: boolean;
};

export function DataGridRow({ children, className, expandContent, label, reserveExpand = false, zebra = false }: DataGridRowProps) {
    const [expanded, setExpanded] = useState(false);

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

                    <span className={classNames(CHEVRON, "pointer-events-none")} aria-hidden="true" />
                )}
            </div>
        </div>
    );
}
