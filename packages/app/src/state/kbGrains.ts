import {useQuery} from "@tanstack/react-query";
import {importResource, KbGrain} from "@brewdocs.beer/kb"
import Grain from "@/model/grain";
import {Units} from "@brewdocs.beer/core";

export const useKbGrains = () => useQuery({
    queryKey: ["kb", "grains"],
    queryFn: () => importResource<KbGrain>("grains")
}).data;

/**
 * Map a Knowledge-base grain to local app model, setting defaults
 */
export function kbGrainToGrain(kbGrain: KbGrain): Grain {
    return {
        name: kbGrain.name,
        weight: {
            value: "0.0oz",
            unit: Units.OUNCES
        },
    } as Grain;
}

const kbGrainsState = {kbToState: kbGrainToGrain};
export default kbGrainsState;
