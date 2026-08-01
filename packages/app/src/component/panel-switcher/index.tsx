import classNames from "classnames";
import {Children, isValidElement, PropsWithChildren, ReactElement, Suspense, useEffect, useRef} from "react";
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
    const tablistRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const list = tablistRef.current;
        const tab = list?.querySelector<HTMLElement>("[aria-selected=\"true\"]");
        if (!list || !tab) return;

        list.scrollTo({ left: Math.max(0, tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2), behavior: "smooth" });
    }, [active]);

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
            ref={tablistRef}
            role="tablist"
            className={compact
                ? "tabs tabs-box tabs-sm w-auto flex-nowrap overflow-x-auto no-scrollbar snap-x snap-proximity scroll-px-1"
                : classNames("tabs tabs-box", actions ? "w-full" : "mx-2 w-auto")}>
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
                        compact ? "tab whitespace-nowrap snap-start" : "tab whitespace-nowrap lg:px-3 px-2.5",
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
        <div className={classNames(compact ? "w-full" : "lg:w-full w-screen h-full lg:px-4", [className])}>
            {actions
                ? (
                    // buttons overlay the right end of the full-width tab bar (kept in
                    // a separate div from the role="tablist" per the structural rule) so
                    // the bar background spans the row instead of shrinking for them.
                    // mx-2 lives here so the bar keeps the same side inset as the
                    // no-actions case (where it's on the tablist itself)
                    <div className="relative mx-2">
                        {tablist}
                        <div className="absolute inset-y-0 right-0 z-10 flex items-center shrink-0 pr-2">
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
