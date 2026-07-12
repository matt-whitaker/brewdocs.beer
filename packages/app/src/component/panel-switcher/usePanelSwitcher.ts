import {useCallback, useEffect, useState} from "react";
import {saveSession, useSession} from "@/state/session";

export type SwitchFn = (tab: string) => void;
export default function usePanelSwitcher(name: string, defaultTab: string): [string, SwitchFn] {
    const sessionKey = `tabs.${name}`;
    const session = useSession();
    const [active, setActive] = useState<string>(session?.[sessionKey] as string ?? defaultTab);
    useEffect(() => {
        if (active !== defaultTab) {
            saveSession(sessionKey, defaultTab);
            setActive(defaultTab);
        }
    }, [defaultTab]);
    const change: SwitchFn = useCallback((tab: string) => {
        saveSession(sessionKey, tab);
        setActive(tab)
    }, []);
    return [
        active,
        change,
    ];
}