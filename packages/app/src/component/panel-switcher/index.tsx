import classNames from "classnames";
import {Children, isValidElement, PropsWithChildren, ReactElement, ReactNode, Suspense} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {PanelSwitcherContentProps} from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import Loading from "@/screen/loading";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass> & {
    name: string;
    defaultTab: string;
    /** tighter tabs, for a sub-nav nested inside another switcher's panel */
    compact?: boolean;
    /** right-aligned controls (e.g. a "Create" button) rendered inline on the tab row */
    actions?: ReactNode;
};

/**
 * Screen-level tabs go full-bleed on mobile — w-screen plus a leading gutter on
 * the first tab — which a nested sub-nav can't do without escaping its panel.
 * Compact stays in flow and leaves the tab padding to daisyui's size modifier
 * instead of overriding it with px-*, so tabs-sm actually takes effect.
 */
const STYLES = {
    default: {
        root: "mt-2 lg:w-full w-screen h-full lg:px-4",
        // width is applied in the component: full-bleed w-screen normally, but
        // w-auto when actions share the row so the right-aligned controls fit
        tablist: "tabs tabs-box px-0",
        tab: "first-of-type:ml-2 tab whitespace-nowrap lg:px-3 px-2.5",
        panel: "bg-base-100 lg:rounded-box transition-opacity"
    },
    compact: {
        root: "w-full",
        tablist: "tabs tabs-box tabs-sm w-fit",
        tab: "tab whitespace-nowrap",
        panel: "transition-opacity"
    }
} as const;

export default function PanelSwitcher({ name, defaultTab, children, className, compact = false, actions }: PanelSwitcherProps) {
    const styles = STYLES[compact ? "compact" : "default"];
    const [active, change, pending] = usePanelSwitcher(name, defaultTab);

    const panels = Children.toArray(children)
        .filter((child): child is ReactElement<PanelSwitcherContentProps> => isValidElement(child));
    const activePanel = panels.find(({ props }) => props.title === active);

    // the tablist lives outside the Suspense boundary so tabs stay visible while
    // panel content loads
    const tablist = (
        <div
            role="tablist"
            className={classNames(
                styles.tablist,
                // width lives here, not in STYLES: full-bleed on mobile normally,
                // but shrink-to-fit when actions need room on the same row
                !compact && (actions ? "w-auto" : "lg:w-auto w-screen")
            )}>
            {panels.map(({ props: { title, label, titleAlt, children: content } }) => (
                <button
                    key={title}
                    type="button"
                    role="tab"
                    aria-selected={title === active}
                    disabled={!content}
                    title={titleAlt || (!content ? "Not implemented" : "")}
                    onClick={() => change(title)}
                    className={classNames(
                        // daisyui v5 styles the active tab neutral and fades inactive tab
                        // text; restore the v4 primary look and full-strength text
                        // (disabled tabs stay dim)
                        styles.tab,
                        {
                            "bg-primary text-primary-content": title === active,
                            "text-base-content": !!content && title !== active,
                            disabled: !content
                        }
                    )}>
                    {label || title}
                </button>
            ))}
        </div>
    );

    return (
        <div className={classNames(styles.root, [className])}>
            {actions
                ? (
                    <div className="flex items-center justify-between gap-2">
                        {tablist}
                        <div className="flex items-center gap-2 shrink-0 pr-2 lg:pr-0">
                            {actions}
                        </div>
                    </div>
                )
                : tablist}
            <div
                role="tabpanel"
                aria-busy={pending}
                className={classNames(
                    styles.panel,
                    {"opacity-60 cursor-progress": pending}
                )}>
                {/* this boundary must stay mounted across tab switches: a transition
                    only holds the previous panel for an already-mounted Suspense;
                    per-panel boundaries would mount fresh each switch and fall back
                    immediately instead */}
                <Suspense fallback={<Loading />}>
                    {activePanel?.props.children}
                </Suspense>
            </div>
        </div>
    );
}
