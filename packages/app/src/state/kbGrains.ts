import {useQuery} from "@tanstack/react-query";
import {importResource, KbGrain} from "@brewdocs.beer/kb"
import Grain from "@/model/grain";
import {Units} from "@brewdocs.beer/core";

/**
 * Map a Knowledge-base grain to local app model, setting defaults
 */
function kbGrainToGrain(kbGrain: KbGrain): Grain {
    return {
        name: kbGrain.name,
        weight: {
            value: "0.0oz",
            unit: Units.OUNCES
        },
    } as Grain;
}

async function fetchKbGrains(): Promise<Grain[]|null> {
    const kbGrains = await importResource<KbGrain>("grains");
    return kbGrains?.map(kbGrainToGrain) ?? null;
}

export const useKbGrains = (): Grain[]|null => useQuery({
    queryKey: ["kb", "grains"],
    queryFn: fetchKbGrains
}).data ?? null;
