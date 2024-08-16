import Preparation from "@brewdocs/model/preparation";
import preparations from "@brewdocs/data/preparations";

export default async function getPreparations(): Promise<Preparation[]> {
    return preparations;
}