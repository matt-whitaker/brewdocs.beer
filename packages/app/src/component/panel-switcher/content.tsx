import {PropsWithChildren} from "react";

export type PanelSwitcherContentProps = PropsWithChildren & {
    title: string;
    /** what the tab button displays; defaults to title. Lets a tab's identity (key, query param) stay stable while its visible text is derived, e.g. a numbered phase name */
    label?: string;
    titleAlt?: string;
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
