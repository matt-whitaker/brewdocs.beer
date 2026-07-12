import {KbYeast} from "@brewdocs.beer/kb";
import {Units} from "@brewdocs.beer/core";
import Yeast from "@/model/yeast";

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