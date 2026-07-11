import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbHop} from "@brewdocs.beer/kb"
import Hop from "@/model/hop";
import {Units} from "@brewdocs.beer/core";

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
    const kbHops = await importResource("hops");
    return kbHops.map(kbHopToHop);
}

export const useKbHops = (): Hop[] => {
    const { data } = useSuspenseQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });

    if (!data) {
        throw new Error("Unable to load hops from Knowledge Base")
    }

    return data;
};
