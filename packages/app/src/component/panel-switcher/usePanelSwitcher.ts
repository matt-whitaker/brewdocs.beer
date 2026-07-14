import {useCallback, useEffect, useState, useTransition} from "react";
import {saveQueryParams, useQueryParams} from "@/state/query-params";

export type SwitchFn = (tab: string) => void;
export default function usePanelSwitcher(name: string, defaultTab: string): [string, SwitchFn, boolean] {
    const queryParamsKey = `tabs.${name}`;
    const queryParams = useQueryParams();
    const [isPending, startTransition] = useTransition();
    const [active, setActive] = useState<string>(queryParams?.[queryParamsKey] as string ?? defaultTab);
    useEffect(() => {
        if (!queryParams?.[queryParamsKey] && active !== defaultTab) {
            saveQueryParams(queryParamsKey, defaultTab);
            startTransition(() => setActive(defaultTab));
        }
    }, [queryParams?.[queryParamsKey], defaultTab]);
    const change: SwitchFn = useCallback((tab: string) => {
        saveQueryParams(queryParamsKey, tab);
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
