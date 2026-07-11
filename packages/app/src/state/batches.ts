import {useSuspenseQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import queryClient from "@/queryClient";
import {FilterFn} from "@/utils/func";

const batchesQueryKey = () => ["batches"] as const;
const loadBatches = () => batchesStorage.list()

const batchQueryKey = (id: string) => ["batch", id] as const;
const loadBatch = ({ queryKey: [, id]}) => batchesStorage.get(id)

export const useSuspenseBatches = (filter?: FilterFn<Batch>): Batch[] => {
    const {data} = useSuspenseQuery({ queryKey: batchesQueryKey(), queryFn: loadBatches });

    if (!data) {
        throw new Error("Unable to load batches")
    }

    return filter ? data.filter(filter) : data;
};

export const useSuspenseBatch = (id: string): Batch => {
    const { data } = useSuspenseQuery({ queryKey: batchQueryKey(id), queryFn: loadBatch })

    if (!data) {
        throw new Error("Unable to load batch")
    }

    return data
};

export const saveBatch = async (id: string, batch: Batch) => {
    await batchesStorage.save(id, batch);
    await queryClient.invalidateQueries({queryKey: batchQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: batchesQueryKey()});
}