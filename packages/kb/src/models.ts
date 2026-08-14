import {Entity, Scalar} from "@brewdocs.beer/core";
import {KbBrewable} from "./brewable";

export interface KbRecipe extends Entity {
    __type: "kbRecipe" | "recipe";
    name: string;
    brewer: string;
    description: string;
    type: string;
    batchSize: Scalar;
    boilTime: Scalar;
    efficiency: Scalar;

    // A recipe's ingredients/equipment live on `brewable` (assignments +
    // per-phase equipment); the old flat top-level arrays were removed in #196.

    targets: {
        og: Scalar;
        fg: Scalar;
        abv: Scalar;
        ibu: string;
        srm: string;
    };

    brewable: KbBrewable;
}

export interface KbRecipeTemplate extends Entity {
    __type: "kbRecipeTemplate";
    name: string;
    description: string;
    brewable: KbBrewable;
}

export interface KbGrain extends Entity {
    __type: "kbGrain";
    name: string;
    lovibond: number;
    origin: string;
    notes: string;
}

export interface KbYeast extends Entity {
    __type: "kbYeast";
    name: string;
    temp: [string, string];
    description: string;
    origin: string;
}

export interface KbHop extends Entity {
    __type: "kbHop";
    name: string;
    alpha: number;
    origin: string;
    notes: string;
    usage: string;
}

export interface KbAdditive extends Entity {
    __type: "kbAdditive";
    name: string;
    type: string;
    dosage: string;
    stage: string;
    notes: string;
}

export interface KbEquipment extends Entity {
    __type: "kbEquipment" | "equipment";
    name: string;
    notes: string;
    count?: number;
}