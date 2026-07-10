import {useQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";

export type FilterFn<T> = (item: T) => boolean;

export const batchesQueryKey = ["batches"] as const;

export const useBatches = (filter?: FilterFn<Batch>) => {
    const {data} = useQuery({queryKey: batchesQueryKey, queryFn: () => batchesStorage.list()});
    return filter && data ? data.filter(filter) : data;
};
