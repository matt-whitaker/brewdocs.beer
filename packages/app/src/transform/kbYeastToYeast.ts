import {Units} from "@brewdocs.beer/core";
import {KbYeast} from "@brewdocs.beer/kb";
import Yeast from "@/model/yeast";

/**
 * Map a Knowledge-base yeasts to a batch-instance app model, setting defaults.
 * Called at the point a yeasts is added to a batch, not at download/cache time.
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
    };
}