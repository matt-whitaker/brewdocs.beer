import {PropsWithChildren, ReactNode} from "react";

export type PanelSwitcherContentProps = PropsWithChildren & {
    title: string;
    /** what the tab button displays; defaults to title. Lets a tab's identity (key, query param) stay stable while its visible text is derived, e.g. a numbered phase name */
    label?: string;
    titleAlt?: string;
    /** right-aligned controls rendered inline on the tab row while this panel is active — opt-in per panel, so the buttons show only on the tabs they belong to. Pass an array for multiple actions (no fragment needed — they're keyed on render) */
    actions?: ReactNode | ReactNode[];
};

/**
 * Declarative panel definition — never renders itself. PanelSwitcher reads
 * title/titleAlt/children off these elements to build the tablist and mount
 * the active panel, so they must be direct children of PanelSwitcher (no
 * wrapping fragments or arrays).
 */
export default function PanelSwitcherContent(_props: PanelSwitcherContentProps) {
    return null;
}
