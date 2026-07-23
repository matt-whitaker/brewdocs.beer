import {Scalar} from "@brewdocs.beer/core";

export default interface Hydrometer {
    name: string;
    date: string;
    gravity: Scalar;
}