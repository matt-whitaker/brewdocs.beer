import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbYeast} from "@brewdocs.beer/kb"
import Yeast from "@/model/yeast";
import {Units} from "@brewdocs.beer/core";

/**
 * Map a Knowledge-base yeast to local app model, setting defaults
 */
function kbYeastToYeast(kbYeast: KbYeast): Yeast {
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
const fetchKbYeasts = async (): Promise<Yeast[]> => {
    const kbYeasts = await importResource("yeasts");
    return kbYeasts.map(kbYeastToYeast);
}

export const useKbYeasts = (): Yeast[] => {
    const { data } = useSuspenseQuery({ queryKey: kbYeastsQueryKey(), queryFn: fetchKbYeasts });

    if (!data) {
        throw new Error("Unable to load yeasts from Knowledge Base")
    }

    return data;
};
