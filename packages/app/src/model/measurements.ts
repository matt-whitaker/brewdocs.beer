import {Scalar} from "@brewdocs.beer/core";

export default interface Measurements {
    og: Scalar;
    fg: Scalar;
    abv: Scalar;
    ibu: string;
    srm: string;
}