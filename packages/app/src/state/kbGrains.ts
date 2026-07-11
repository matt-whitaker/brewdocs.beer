import {useSuspenseQuery} from "@tanstack/react-query";
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

const kbGrainsQueryKey = () => ["kb", "grains"];
const fetchKbGrains = async (): Promise<Grain[]> => {
    const kbGrains = await importResource<KbGrain>("grains");
    return kbGrains.map(kbGrainToGrain);
}

export const useKbGrains = (): Grain[] => {
    const { data } = useSuspenseQuery({queryKey: kbGrainsQueryKey(), queryFn: fetchKbGrains });

    if (!data) {
        throw new Error("Unable to load grains from Knowledge Base")
    }

    return data;
};
