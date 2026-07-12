import {KbHop} from "@brewdocs.beer/kb";
import {Units} from "@brewdocs.beer/core";
import Hop from "@/model/hop";

/**
 * Map a Knowledge-base yeasts to a batch-instance app model, setting defaults.
 * Called at the point a yeasts is added to a batch, not at download/cache time.
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