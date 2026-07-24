import {UNITS} from "@brewdocs.beer/core";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import Additive from "@/model/additive";
import {PhaseType, ResourceType} from "@/model/brewable";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";

/** the only phases a hop addition can land in — mirrors the app Hop model's phase union */
export const HOP_PHASE_OPTIONS = [
    { value: "boil", name: "Boil" },
    { value: "secondary", name: "Secondary" },
    { value: "dry", name: "Dry Hop" },
];

/** the fixed set of brewable phases an assignment can target — same order as `defaultBrewable`'s PHASE_TYPES */
export const PHASE_TYPE_OPTIONS = [
    { value: "mash", name: "Mash" },
    { value: "boil", name: "Boil" },
    { value: "ferment", name: "Ferment" },
];

export const PHASE_TYPE_LABELS: Record<PhaseType, string> = {
    mash: "Mash",
    boil: "Boil",
    ferment: "Ferment",
};

/** subsection order within a phase group, and the options offered by the assignment add-row */
export const RESOURCE_TYPES: ResourceType[] = ["grain", "hop", "yeast", "additive"];

export const RESOURCE_TYPE_OPTIONS = [
    { value: "grain", name: "Grain" },
    { value: "hop", name: "Hop" },
    { value: "yeast", name: "Yeast" },
    { value: "additive", name: "Additive" },
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
    grain: "Grains",
    hop: "Hops",
    yeast: "Yeasts",
    additive: "Additives",
};

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

/** Default boil time for a freeform additive — there's no kb catalog for additives, so the name is typed rather than picked. */
export function defaultAdditive(name: string): Additive {
    return {
        name,
        boil: {
            value: "15min",
            unit: UNITS.MINUTES
        },
    };
}
