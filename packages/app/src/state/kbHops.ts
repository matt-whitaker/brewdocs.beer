import {useQuery} from "@tanstack/react-query";
import {importResource, KbHop} from "@brewdocs.beer/kb"
import Hop from "@/model/hop";
import {Units} from "@brewdocs.beer/core";

export const useKbHops = () => useQuery({
    queryKey: ["kb", "hops"],
    queryFn: () => importResource<KbHop>("hops")
}).data;

/**
 * Map a Knowledge-base hop to local app model, setting defaults
 */
export function kbHopToHop(kbHop: KbHop): Hop {
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

const kbHopsState = {kbToState: kbHopToHop};
export default kbHopsState;
