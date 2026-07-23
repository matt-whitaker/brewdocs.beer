import {Scalar} from "@brewdocs.beer/core";

export default interface Hop {
    name: string;
    weight: Scalar;
    alpha: Scalar;
    boil: Scalar;
    phase: "boil"|"secondary"|"dry";
}