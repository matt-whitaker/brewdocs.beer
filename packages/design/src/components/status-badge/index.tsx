import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type StatusBadgeProps = PropsWithChildren & PropsWithClass;

/**
 * The project-status tag — an accent badge in uppercase bold (e.g. "demo" in the
 * app sidebar, "In Development" on the www splash). Shared here so both stay in
 * sync. Its rounded-rectangle corners come from the theme's `--radius-selector`.
 */
export function StatusBadge({ children, className }: StatusBadgeProps) {
    return (
        <span className={classNames("badge badge-accent uppercase font-bold", [className])}>
            {children}
        </span>
    );
}
