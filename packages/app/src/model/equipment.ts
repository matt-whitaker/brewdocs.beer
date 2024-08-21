import {Named} from "@/model/type";

export type EquipmentUses = "all"|"mash"|"boil"|"brew"|"ferment"|"primary"|"secondary"|"transfer"|"condition"|"clean"|"serve"|"measure"|"starter";
export default interface Equipment extends Named {
    use: EquipmentUses[];
    count?: number;
}