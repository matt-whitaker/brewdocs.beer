import {Named} from "@/model/type";

export default interface Equipment extends Named {
    use: string[];
    count?: number;
}