import {Entity, Scalar} from "@brewdocs.beer/core";
import {KbBrewable} from "./brewable";

export interface KbRecipe extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
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

export interface KbGrain extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
    name: string;
    lovibond: number;
    origin: string;
    notes: string;
}

export interface KbYeast extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
    name: string;
    temp: [string, string];
    description: string;
    origin: string;
}

export interface KbHop extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
    name: string;
    alpha: number;
    origin: string;
    notes: string;
    usage: string;
}

export interface KbAdditive extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
    name: string;
    type: string;
    dosage: string;
    stage: string;
    notes: string;
}

export interface KbEquipment extends Entity {
    /** item schema version; hard-coded as KB_MODEL_VERSION in build-json.js, stamped at build time */
    version: number;
    name: string;
    use: string[];
    notes: string;
    count?: number;
}