import {Entity} from "@brewdocs.beer/core";

export interface KbRecipe extends Entity {

}

export interface KbGrain extends Entity {
    name: string;
    lovibond: number;
    origin: string;
    notes: string;
}

export interface KbYeast extends Entity {
    name: string;
    temp: [string, string];
    description: string;
    origin: string;
}

export interface KbHop extends Entity {
    name: string;
    alpha: number;
    origin: string;
    notes: string;
    usage: string;
}