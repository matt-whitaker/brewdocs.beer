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
        // Deps are deliberately narrower than the rule wants: we key on the
        // *specific* param value, not the whole queryParams object (which would
        // re-fire on unrelated params). `active` is omitted safely because it
        // only ever changes via change(), which also writes the param — so when
        // the guard's `!queryParams?.[queryParamsKey]` holds, active is still the
        // initial value. queryParamsKey is constant (name is fixed per mount).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams?.[queryParamsKey], defaultTab]);
    const change: SwitchFn = useCallback((tab: string) => {
        saveQueryParams(queryParamsKey, tab);
        // transition: if the newly-mounted panel suspends, the previous panel
        // stays visible until it resolves; isPending signals the wait
        startTransition(() => setActive(tab));
        // queryParamsKey is constant for a mounted switcher (name never changes),
        // so `change` stays referentially stable; listing it just fixes the
        // latent stale-closure if a caller ever did vary name
    }, [queryParamsKey]);
    return [
        active,
        change,
        isPending,
    ];
}
