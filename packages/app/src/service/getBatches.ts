import batches from "@/data/batches";
import {Batch} from "@/model/batch";

export default async function getBatches(): Promise<Batch[]> {
    return batches;
}