import {PropsWithChildren, useCallback, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";
import {Chevron} from "@/component/svg";

/** paired with the group class by the sibling rule in styles.css */
const COLLAPSED = "dg-collapsed";

export type DataGridHeaderRowProps = PropsWithChildren & PropsWithClass & {
    /** accessible label for the collapse toggle, e.g. "Hops" */
    label?: string;
    /** starting state only — the header owns it from then on */
    defaultCollapsed?: boolean;
    /** fires with the new state so the caller can persist it */
    onToggle?: (collapsed: boolean) => void;
    /**
     * Opt in to a collapse toggle; a header is a plain label otherwise. The
     * collapse rule hides *all* following siblings, so several collapsible
     * headers in one grid would fold each other's content — give each its own
     * grid, or leave them as labels.
     */
    collapsible?: boolean;
}

/**
 * A group heading inside a DataGrid — a plain label unless `collapsible` is set.
 * It's a flat sibling of the rows it heads, and collapsing is a display rule on
 * everything after it in the same container (see styles.css), so the enclosing
 * DataGrid is what bounds the collapse.
 *
 * The heading line borrows DataGridRow's flex trick ([flex-1 content][chevron
 * track]) so its chevron sits in the same track as an expandable row's.
 */
export default function DataGridHeaderRow({ children, className, label, defaultCollapsed = false, onToggle, collapsible = false }: DataGridHeaderRowProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const onClick = useCallback(() => {
        const next = !collapsed;
        setCollapsed(next);
        onToggle?.(next);
    }, [collapsed, onToggle]);

    return (
        <div className={classNames("flex items-center gap-x-1 px-1 pt-3 pb-1 -mb-2", [className], { [COLLAPSED]: collapsible && collapsed })}>
            <div className="flex-1 min-w-0 text-2xs uppercase tracking-wide font-semibold text-base-content/60">
                {children}
            </div>
            {collapsible && (
                <button
                    type="button"
                    aria-expanded={!collapsed}
                    aria-label={`${collapsed ? "Show" : "Hide"} ${label ?? "group"}`}
                    onClick={onClick}
                    className="btn btn-xs btn-ghost p-0 shrink-0"
                >
                    <Chevron className={classNames("w-4 transition-transform", {"rotate-180": !collapsed})} />
                </button>
            )}
        </div>
    );
}
