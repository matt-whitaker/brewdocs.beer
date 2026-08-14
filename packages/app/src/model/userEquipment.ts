import {Entity} from "@brewdocs.beer/core";

export default interface UserEquipment extends Entity {
    name: string;
    notes?: string;
    count?: number;
}
