import {UNITS} from "@brewdocs.beer/core";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";

/** the only phases a hop addition can land in — mirrors the app Hop model's phase union */
export const HOP_PHASE_OPTIONS = [
    { value: "boil", name: "Boil" },
    { value: "secondary", name: "Secondary" },
    { value: "dry", name: "Dry Hop" },
];

/** Default weight for a grain newly picked from the catalog. */
export function kbGrainToRecipeGrain(kbGrain: KbGrain): Grain {
    return {
        name: kbGrain.name,
        weight: {
            value: "0.0lb",
            unit: UNITS.POUNDS
        },
    };
}

/** Default weight/boil/phase for a hop newly picked from the catalog; alpha carries the catalog's value. */
export function kbHopToRecipeHop(kbHop: KbHop): Hop {
    return {
        name: kbHop.name,
        weight: {
            value: "0.0oz",
            unit: UNITS.OUNCES
        },
        alpha: {
            value: `${kbHop.alpha}%`,
            unit: UNITS.PERCENT
        },
        boil: {
            value: "60min",
            unit: UNITS.MINUTES
        },
        phase: "boil"
    };
}

/** Default attenuation/temp for a yeast newly picked from the catalog. */
export function kbYeastToRecipeYeast(kbYeast: KbYeast): Yeast {
    return {
        name: kbYeast.name,
        avg_attn: {
            value: "70%",
            unit: UNITS.PERCENT
        },
        temp: {
            value: "0°F",
            unit: UNITS.FAHRENHEIT
        },
        starter: false
    };
}
