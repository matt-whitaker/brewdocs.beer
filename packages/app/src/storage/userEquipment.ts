import UserEquipment from "@/model/userEquipment";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";

export class UserEquipmentStorage extends Forage<UserEquipment> {
    constructor() {
        super("userEquipment", LF_INDEXEDDB);
    }
}

const userEquipmentStorage = new UserEquipmentStorage();
export default userEquipmentStorage;
