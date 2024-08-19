import {Named} from "@/model/type";

export default interface Yeast extends Named {
    avg_attn: string;
    temp: string;
    starter: boolean;
}