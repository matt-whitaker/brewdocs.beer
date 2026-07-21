import {Entity} from "@brewdocs.beer/core";

export interface KbScalar {
    value: string;
    unit: string;
}

export interface KbRecipe extends Entity {
    /** the kb package version this item was built from; stamped by build-json.js */
    version: string;
    name: string;
    brewer: string;
    description: string;
    type: string;
    batchSize: KbScalar;
    boilTime: KbScalar;
    efficiency: KbScalar;

    grains: {
        name: string;
        weight: KbScalar;
    }[];

    mash: {
        name: string;
        temp: KbScalar;
        time: KbScalar;
        grains: string;
    }[];

    boil: {
        name: string;
        time: KbScalar;
        hops: string;
    }[];

    hops: {
        name: string;
        weight: KbScalar;
        alpha: KbScalar;
        boil: KbScalar;
        phase: string;
    }[];

    yeasts: {
        name: string;
        avg_attn: KbScalar;
        temp: KbScalar;
        starter: boolean;
    }[];

    additives: {
        name: string;
        boil: KbScalar;
    }[];

    equipment: {
        name: string;
        use: string[];
        count?: number;
    }[];

    checklist: {
        name: string;
        uses: string[];
    }[];

    targets: {
        og: KbScalar;
        fg: KbScalar;
        abv: KbScalar;
        ibu: string;
        srm: string;
    };
}

export interface KbGrain extends Entity {
    /** the kb package version this item was built from; stamped by build-json.js */
    version: string;
    name: string;
    lovibond: number;
    origin: string;
    notes: string;
}

export interface KbYeast extends Entity {
    /** the kb package version this item was built from; stamped by build-json.js */
    version: string;
    name: string;
    temp: [string, string];
    description: string;
    origin: string;
}

export interface KbHop extends Entity {
    /** the kb package version this item was built from; stamped by build-json.js */
    version: string;
    name: string;
    alpha: number;
    origin: string;
    notes: string;
    usage: string;
}