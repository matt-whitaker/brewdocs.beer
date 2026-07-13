import {useCallback, useEffect, useState, useTransition} from "react";
import {saveSession, useSession} from "@/state/session";

export type SwitchFn = (tab: string) => void;
export default function usePanelSwitcher(name: string, defaultTab: string): [string, SwitchFn, boolean] {
    const sessionKey = `tabs.${name}`;
    const session = useSession();
    const [isPending, startTransition] = useTransition();
    const [active, setActive] = useState<string>(session?.[sessionKey] as string ?? defaultTab);
    useEffect(() => {
        if (!session?.[sessionKey] && active !== defaultTab) {
            saveSession(sessionKey, defaultTab);
            startTransition(() => setActive(defaultTab));
        }
    }, [session?.[sessionKey], defaultTab]);
    const change: SwitchFn = useCallback((tab: string) => {
        saveSession(sessionKey, tab);
        // transition: if the newly-mounted panel suspends, the previous panel
        // stays visible until it resolves; isPending signals the wait
        startTransition(() => setActive(tab));
    }, []);
    return [
        active,
        change,
        isPending,
    ];
}
