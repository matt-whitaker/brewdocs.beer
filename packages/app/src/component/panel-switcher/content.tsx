import {PropsWithChildren, ReactNode} from "react";

export type PanelSwitcherContentProps = PropsWithChildren & {
    title: string;

    label?: string;
    titleAlt?: string;

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
