import {useSuspenseQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import queryClient from "@/queryClient";
import batchesStorage from "@/storage/batches";
import {FilterFn} from "@/utils/func";

export const batchesQueryKey = () => ["batches"];
export const loadBatches = () => batchesStorage.list();

export const batchQueryKey = (id: string): [string, string] => ["batch", id];
export const loadBatch = ({ queryKey: [, id]}: { queryKey: [string, string]}) => batchesStorage.get(id);

export const useBatches = (filter?: FilterFn<Batch>): Batch[] => {
    const {data} = useSuspenseQuery({ queryKey: batchesQueryKey(), queryFn: loadBatches });

    if (!data) {
        throw new Error("Unable to load batches");
    }

    return filter ? data.filter(filter) : data;
};

export const useBatch = (id: string): Batch => {
    const { data } = useSuspenseQuery({ queryKey: batchQueryKey(id), queryFn: loadBatch });

    if (!data) {
        throw new Error("Unable to load batch");
    }

    return data;
};

export const saveBatch = async (id: string, batch: Batch) => {
    await batchesStorage.save(id, batch);
    await queryClient.invalidateQueries({queryKey: batchQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: batchesQueryKey()});
};