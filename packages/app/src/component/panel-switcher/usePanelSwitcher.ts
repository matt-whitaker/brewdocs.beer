import {useCallback, useEffect, useState, useTransition} from "react";
import {saveQueryParams, useQueryParams} from "@/state/queryParams";

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams?.[queryParamsKey], defaultTab]);
    const change: SwitchFn = useCallback((tab: string) => {
        saveQueryParams(queryParamsKey, tab);

        startTransition(() => setActive(tab));
    }, [queryParamsKey]);
    return [
        active,
        change,
        isPending,
    ];
}
