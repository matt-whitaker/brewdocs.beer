import {Scalar} from "@brewdocs.beer/core";

export default interface Yeast {
    name: string;
    avg_attn: Scalar;
    temp: Scalar;
    starter: boolean;
}