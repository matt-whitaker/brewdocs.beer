import {Scalar} from "@brewdocs.beer/core";

export interface Mash {
    name: string;
    temp: Scalar;
    time: Scalar;
    grains: "all"
}