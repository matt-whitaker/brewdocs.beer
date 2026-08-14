import UserEquipment from "@/model/userEquipment";
import {saveUserEquipment} from "@/state/userEquipment";
import userEquipmentStorage from "@/storage/userEquipment";

export default async function createUserEquipment(name: string): Promise<string> {
    const id = await userEquipmentStorage.generateId();
    const equipment: UserEquipment = {id, __type: "equipment", name, notes: ""};

    await saveUserEquipment(id, equipment);

    return id;
}
