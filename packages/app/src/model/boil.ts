import {Named} from "@/model/type";

export default interface Boil extends Named {
    time: string;
    hops: "all"|"base"|"secondary"
}