import classNames from "classnames";
import {Children, forwardRef, isValidElement, PropsWithChildren, ReactElement, Suspense, useEffect, useImperativeHandle, useRef} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {PanelSwitcherContentProps} from "@/component/panel-switcher/content";
import usePanelSwitcher, {SwitchFn} from "@/component/panel-switcher/usePanelSwitcher";
import Loading from "@/screen/loading";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass> & {
    name: string;
    defaultTab: string;

    compact?: boolean;
};

export type PanelSwitcherHandle = { activate: SwitchFn };

const PanelSwitcher = forwardRef<PanelSwitcherHandle, PanelSwitcherProps>(function PanelSwitcher(
    { name, defaultTab, children, className, compact = false },
    ref
) {
    const [active, change, pending] = usePanelSwitcher(name, defaultTab);
    const tablistRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({ activate: change }), [change]);

    useEffect(() => {
        const list = tablistRef.current;
        const tab = list?.querySelector<HTMLElement>("[aria-selected=\"true\"]");
        if (!list || !tab) return;

        list.scrollTo({ left: Math.max(0, tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2), behavior: "smooth" });
    }, [active]);

    const panels = Children.toArray(children)
        .filter((child): child is ReactElement<PanelSwitcherContentProps> => isValidElement(child));
    const activePanel = panels.find(({ props }) => props.title === active);

    const actions = activePanel?.props.actions;

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

                    <div className="relative mx-2">
                        {tablist}
                        <div className="absolute inset-y-0 right-0 z-10 flex items-center shrink-0 pr-2">
                            {}
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
                {}
                <Suspense fallback={<Loading />}>
                    {activePanel?.props.children}
                </Suspense>
            </div>
        </div>
    );
});

export default PanelSwitcher;
