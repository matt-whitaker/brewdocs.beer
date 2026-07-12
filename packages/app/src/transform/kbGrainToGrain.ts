import {KbGrain} from "@brewdocs.beer/kb";
import {Units} from "@brewdocs.beer/core";
import Grain from "@/model/grain";

/**
 * Map a Knowledge-base grain to a batch-instance app model, setting defaults.
 * Called at the point a grain is added to a batch, not at download/cache time.
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