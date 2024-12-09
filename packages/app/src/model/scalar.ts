import {Currencies, Units} from "@brewdocs.beer/core";

export default interface Scalar {
    value: string;
    unit?: Units;
    currency?: Currencies;
}