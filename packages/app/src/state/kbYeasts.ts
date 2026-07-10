import {useQuery} from "@tanstack/react-query";
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

async function fetchKbYeasts(): Promise<Yeast[]|null> {
    const kbYeasts = await importResource<KbYeast>("yeasts");
    return kbYeasts?.map(kbYeastToYeast) ?? null;
}

export const useKbYeasts = () => useQuery({
    queryKey: ["kb", "yeasts"],
    queryFn: fetchKbYeasts
}).data;
