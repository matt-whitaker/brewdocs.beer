import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbYeast} from "@brewdocs.beer/kb"
import Yeast from "@/model/yeast";
import {Units} from "@brewdocs.beer/core";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import queryClient from "@/queryClient";

/**
 * Map a Knowledge-base yeast to a batch-instance app model, setting defaults.
 * Called at the point a yeast is added to a batch, not at download/cache time.
 */
export function kbYeastToYeast(kbYeast: KbYeast): Yeast {
    return {
        name: kbYeast.name,
        avg_attn: {
            value: "70%",
            unit: Units.PERCENT
        },
        temp: {
            value: "0°F",
            unit: Units.FAHRENHEIT
        },
        starter: false
    } as Yeast;
}

const kbYeastsQueryKey = () => ["kb", "yeasts"];
const fetchKbYeasts = async (): Promise<KbYeast[]> => {
    const cached = await kbStorage.getResource("yeasts");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Yeasts data isn't downloaded yet, and you're offline.");
    }

    const yeasts = await importResource("yeasts");
    return kbStorage.saveResource("yeasts", yeasts);
}

export const prefetchKbYeasts = () => queryClient.prefetchQuery({ queryKey: kbYeastsQueryKey(), queryFn: fetchKbYeasts });

export const useKbYeasts = (): KbYeast[] => {
    const { data } = useSuspenseQuery({ queryKey: kbYeastsQueryKey(), queryFn: fetchKbYeasts });

    if (!data) {
        throw new Error("Unable to load yeasts from Knowledge Base")
    }

    return data;
};
