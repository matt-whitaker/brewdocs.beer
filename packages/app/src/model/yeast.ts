// Every type in this file is documented field by field in ../../MODELS.md — read there for what each means.

import {Scalar} from "@brewdocs.beer/core";

export default interface Yeast {
    name: string;
    avg_attn: Scalar;
    temp: Scalar;
    starter: boolean;
}