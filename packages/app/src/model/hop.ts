import {Named} from "@/model/type";

export default interface Hop extends Named {
    weight: string;
    alpha: string;
    boil: string;
}