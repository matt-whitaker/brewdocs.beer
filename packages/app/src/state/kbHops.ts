import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbHop} from "@brewdocs.beer/kb"
import Hop from "@/model/hop";
import {Units} from "@brewdocs.beer/core";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import queryClient from "@/queryClient";

/**
 * Map a Knowledge-base hop to local app model, setting defaults
 */
function kbHopToHop(kbHop: KbHop): Hop {
    return {
        name: kbHop.name,
        weight: {
            value: "0.0oz",
            unit: Units.OUNCES
        },
        alpha: {
            value: `${kbHop.alpha}%`,
            unit: Units.PERCENT
        },
        boil: {
            value: "60min",
            unit: Units.MINUTES
        },
        phase: "boil"
    } as Hop;
}

const kbHopsQueryKey = () => ["kb", "hops"]
const fetchKbHops = async (): Promise<Hop[]> => {
    const cached = await kbStorage.getResource("hops");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Hops data isn't downloaded yet, and you're offline.");
    }

    const hops = (await importResource("hops")).map(kbHopToHop);
    return kbStorage.saveResource("hops", hops);
}

export const prefetchKbHops = () => queryClient.prefetchQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });

export const useKbHops = (): Hop[] => {
    const { data } = useSuspenseQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });

    if (!data) {
        throw new Error("Unable to load hops from Knowledge Base")
    }

    return data;
};
