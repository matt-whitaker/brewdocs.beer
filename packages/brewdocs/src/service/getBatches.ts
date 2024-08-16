import batches from "@brewdocs/data/batches";
import {Batch} from "@brewdocs/model/batch";

export default async function getBatches(): Promise<Batch[]> {
    return batches;
}