import Preparation from "@/model/preparation";
import preparations from "@/data/preparations";

export default async function getPreparations(): Promise<Preparation[]> {
    return preparations;
}