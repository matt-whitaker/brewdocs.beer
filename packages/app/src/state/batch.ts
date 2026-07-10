import {useQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";

export const batchQueryKey = (id: string) => ["batch", id] as const;

export const useBatch = (id: string|null = null) => useQuery({
    queryKey: batchQueryKey(id ?? ""),
    queryFn: () => batchesStorage.get(id!),
    enabled: !!id
}).data;
