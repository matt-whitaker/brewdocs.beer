import {useQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import queryClient from "@/queryClient";

export type FilterFn<T> = (item: T) => boolean;

export const batchesQueryKey = ["batches"] as const;
export const batchQueryKey = (id: string) => ["batch", id] as const;

export const useBatches = (filter?: FilterFn<Batch>): Batch[]|null => {
    const {data} = useQuery({queryKey: batchesQueryKey, queryFn: () => batchesStorage.list()});
    return filter && data ? data.filter(filter) : data;
};
export const useBatch = (id: string | null = null): Batch|null => useQuery({
    queryKey: batchQueryKey(id ?? ""),
    queryFn: () => batchesStorage.get(id!),
    enabled: !!id
}).data;

export const saveBatch = async (id: string, batch: Batch) => {
    await batchesStorage.save(id, batch);
    await queryClient.invalidateQueries({queryKey: batchQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: batchesQueryKey});
}