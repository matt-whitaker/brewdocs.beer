import {Named} from "@/model/type";

export interface Mash extends Named {
    temp: string;
    time: string;
    grains: "all"|"base"|"secondary"
}