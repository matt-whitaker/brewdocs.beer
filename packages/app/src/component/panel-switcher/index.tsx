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
 * A React-controlled tablist/tabpanel that mounts only the active panel. Two
 * layouts, keyed off `compact`: screen-level tabs go full-bleed on mobile
 * (w-screen + a leading gutter on the first tab), which a nested sub-nav can't do
 * without escaping its panel; compact stays in flow and leaves the tab padding to
 * daisyui's size modifier (tabs-sm) instead of overriding it with px-*.
 */
export default function PanelSwitcher({ name, defaultTab, children, className, compact = false }: PanelSwitcherProps) {
    const [active, change, pending] = usePanelSwitcher(name, defaultTab);

    const panels = Children.toArray(children)
        .filter((child): child is ReactElement<PanelSwitcherContentProps> => isValidElement(child));
    const activePanel = panels.find(({ props }) => props.title === active);

    // actions are declared per-panel, so only the active panel's show on the tab
    // row — they swap (or vanish) as tabs change, and appear immediately on switch
    // since they don't depend on the panel's async content
    const actions = activePanel?.props.actions;

    // the tablist lives outside the Suspense boundary so tabs stay visible while
    // panel content loads. default width is full-bleed on mobile, but shrinks to
    // fit when actions need room on the same row
    const tablist = (
        <div
            role="tablist"
            className={compact
                ? "tabs tabs-box tabs-sm w-fit"
                : classNames("tabs tabs-box px-0", actions ? "w-auto" : "lg:w-auto w-screen")}>
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
                        compact ? "tab whitespace-nowrap" : "first-of-type:ml-2 tab whitespace-nowrap lg:px-3 px-2.5",
                        // daisyui v5 styles the active tab neutral and fades inactive tab
                        // text; restore the v4 primary look and full-strength text
                        // (disabled tabs stay dim)
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
        <div className={classNames(compact ? "w-full" : "mt-2 lg:w-full w-screen h-full lg:px-4", [className])}>
            {actions
                ? (
                    <div className="flex items-center justify-between gap-2">
                        {tablist}
                        <div className="flex items-center shrink-0 pr-2 lg:pr-0">
                            {/* toArray keys an array of actions, so callers can pass
                                a bare array instead of wrapping them in a fragment */}
                            {Children.toArray(actions)}
                        </div>
                    </div>
                )
                : tablist}
            <div
                role="tabpanel"
                aria-busy={pending}
                className={classNames(
                    compact ? "transition-opacity" : "bg-base-100 lg:rounded-box transition-opacity",
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
