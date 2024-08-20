import { useCallback, useState } from "react";

export type SwitchFn = (title: string) => void;
export default function usePanelSwitcher(defaultTitle: string): [string, SwitchFn] {
    const [active, setActive] = useState<string>(defaultTitle);
    const change: SwitchFn = useCallback((title: string) => setActive(title), []);
    return [
        active,
        change,
    ];
}