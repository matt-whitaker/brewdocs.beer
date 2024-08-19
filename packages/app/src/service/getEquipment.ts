import Equipment from "@/model/equipment";
import equipment from "@/data/equipment";

export default async function getEquipment(): Promise<Equipment[]> {
    return equipment;
}