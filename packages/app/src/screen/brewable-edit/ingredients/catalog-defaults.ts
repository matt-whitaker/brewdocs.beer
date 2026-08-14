import {UNITS} from "@brewdocs.beer/core";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import Additive from "@/model/additive";
import {PhaseType, ResourceType} from "@/model/brewable";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";

export const PHASE_TYPE_LABELS: Record<PhaseType, string> = {
    mash: "Mash",
    boil: "Boil",
    ferment: "Ferment",
    carbonation: "Carbonation",
    conditioning: "Conditioning",
};

/** subsection order within a phase group */
export const RESOURCE_TYPES: ResourceType[] = ["grain", "hop", "yeast", "additive"];

export const RESOURCE_TYPE_PHASE_TYPES: Partial<Record<ResourceType, PhaseType[]>> = {
    grain: ["mash"],
    hop: ["boil"],
    yeast: ["ferment"],
};

export const resourceTypesForPhase = (type: PhaseType): ResourceType[] =>
    RESOURCE_TYPES.filter(resourceType => {
        const phaseTypes = RESOURCE_TYPE_PHASE_TYPES[resourceType];
        return !phaseTypes || phaseTypes.includes(type);
    });

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
    grain: "Grains",
    hop: "Hops",
    yeast: "Yeasts",
    additive: "Additives",
};

export const RESOURCE_TYPE_SINGULAR_LABELS: Record<ResourceType, string> = {
    grain: "grain",
    hop: "hop",
    yeast: "yeast",
    additive: "additive",
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
        }
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

/** Default weight — plus a boil time outside Conditioning — for a freeform additive; there's no kb catalog for additives, so the name is typed rather than picked. */
export function defaultAdditive(name: string, phaseType: PhaseType): Additive {
    const additive: Additive = {
        name,
        weight: {
            value: "1.0oz",
            unit: UNITS.OUNCES
        },
    };
    if (phaseType === "conditioning") return additive;
    return {
        ...additive,
        boil: {
            value: "15min",
            unit: UNITS.MINUTES
        },
    };
}
