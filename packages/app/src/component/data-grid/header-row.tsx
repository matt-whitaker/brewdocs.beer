import classNames from "classnames";
import {PropsWithChildren, useCallback, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {CHEVRON, CHEVRON_ICON} from "@/component/data-grid/styles";
import {Chevron} from "@/component/svg";

/** paired with the group class by the sibling rule in styles.css */
const COLLAPSED = "dg-collapsed";

const HEADER = "flex items-center gap-x-1 px-1 pt-3 pb-1";
const HEADING = "flex-1 min-w-0 text-left text-2xs uppercase tracking-wide font-semibold text-base-content/60";

export type DataGridHeaderRowProps = PropsWithChildren & PropsWithClass & {
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
};

/**
 * A group heading inside a DataGrid — a plain label unless `collapsible` is set.
 * It's a flat sibling of the rows it heads, and collapsing is a display rule on
 * everything after it in the same container (see styles.css), so the enclosing
 * DataGrid is what bounds the collapse.
 *
 * Collapsible headers are a single button end to end, which is also where their
 * accessible name comes from — so `children` should stay plain text. The chevron
 * is decorative markup inside it, sharing DataGridRow's flex trick ([flex-1
 * content][chevron track]) so the two line up.
 */
export default function DataGridHeaderRow({ children, className, defaultCollapsed = false, onToggle, collapsible = false }: DataGridHeaderRowProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const onClick = useCallback(() => {
        const next = !collapsed;
        setCollapsed(next);
        onToggle?.(next);
    }, [collapsed, onToggle]);

    if (!collapsible) {
        return (
            <div className={classNames(HEADER, [className])}>
                <div className={HEADING}>{children}</div>
            </div>
        );
    }

    return (
        <button
            type="button"
            aria-expanded={!collapsed}
            onClick={onClick}
            // w-full because the header isn't always in a stretching flex parent
            className={classNames(HEADER, "group w-full cursor-pointer", [className], { [COLLAPSED]: collapsed })}
        >
            <span className={classNames(HEADING, "group-hover:text-base-content")}>{children}</span>
            {/* purely an indicator — pointer-events-none keeps it from swallowing
                the click and, since :hover/:active can't match it, leaves it with
                no interaction state of its own */}
            <span className={classNames(CHEVRON, "pointer-events-none")}>
                <Chevron className={classNames(CHEVRON_ICON, {"rotate-180": !collapsed})} />
            </span>
        </button>
    );
}
