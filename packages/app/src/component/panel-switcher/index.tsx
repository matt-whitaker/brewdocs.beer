import classNames from "classnames";
import {Children, isValidElement, PropsWithChildren, ReactElement, Suspense} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {PanelSwitcherContentProps} from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import Loading from "@/screen/loading";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass> & {
    name: string;
    defaultTab: string;
    /** tighter tabs, for a sub-nav nested inside another switcher's panel */
    compact?: boolean;
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
        tablist: "tabs tabs-box px-0 lg:w-auto w-screen",
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

export default function PanelSwitcher({ name, defaultTab, children, className, compact = false }: PanelSwitcherProps) {
    const styles = STYLES[compact ? "compact" : "default"];
    const [active, change, pending] = usePanelSwitcher(name, defaultTab);

    const panels = Children.toArray(children)
        .filter((child): child is ReactElement<PanelSwitcherContentProps> => isValidElement(child));
    const activePanel = panels.find(({ props }) => props.title === active);

    return (
        <div className={classNames(styles.root, [className])}>
            {/* the tablist lives outside the Suspense boundary so tabs stay
                visible while panel content loads */}
            <div role="tablist" className={styles.tablist}>
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
