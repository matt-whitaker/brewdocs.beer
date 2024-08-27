
export type EquipmentUses = "all"|"mash"|"boil"|"brew"|"ferment"|"primary"|"secondary"|"transfer"|"condition"|"clean"|"serve"|"measure"|"starter"|"kegging";
export default interface Equipment {
    name: string;
    use: EquipmentUses[];
    count?: number;
}