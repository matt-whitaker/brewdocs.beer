import {KbEquipment} from "@brewdocs.beer/kb";

export default interface UserEquipment extends KbEquipment {
    __type: "equipment";
    sourceId?: string;
}
