import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
import {Children, isValidElement, PropsWithChildren, ReactElement, Suspense} from "react";
import Loading from "@/screen/loading";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {PanelSwitcherContentProps} from "@/component/panel-switcher/content";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass> & {
    name: string;
    defaultTab: string;
}

export default function PanelSwitcher({ name, defaultTab, children, className }: PanelSwitcherProps) {
    const [active, change, pending] = usePanelSwitcher(name, defaultTab);

    const panels = Children.toArray(children)
        .filter((child): child is ReactElement<PanelSwitcherContentProps> => isValidElement(child));
    const activePanel = panels.find(({ props }) => props.title === active);

    return (
        <div className={classNames("mt-2 lg:w-full w-screen h-full lg:px-4", [className])}>
            {/* the tablist lives outside the Suspense boundary so tabs stay
                visible while panel content loads */}
            <div role="tablist" className="tabs tabs-box px-0 lg:w-auto w-screen">
                {panels.map(({ props: { title, titleAlt, children: content } }) => (
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
                            "first-of-type:ml-2 tab whitespace-nowrap lg:px-3 px-2.5",
                            {
                                "bg-primary text-primary-content": title === active,
                                "text-base-content": !!content && title !== active,
                                disabled: !content
                            }
                        )}>
                        {title}
                    </button>
                ))}
            </div>
            <div
                role="tabpanel"
                aria-busy={pending}
                className={classNames(
                    "bg-base-100 lg:rounded-box transition-opacity",
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
    )
}
