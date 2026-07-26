import {useSuspenseQuery} from "@tanstack/react-query";
import ensureBrewableIds from "@/actions/ensureBrewableIds";
import Batch from "@/model/batch";
import queryClient from "@/queryClient";
import batchesStorage from "@/storage/batches";
import {FilterFn} from "@/utils/func";

// migration-on-load isn't wired yet (see CLAUDE.md), so a batch stored before ids
// existed gets them minted here for this session; ensureBrewableIds is idempotent,
// so the next edit-save (updateBatch) persists them for real
const ensureIds = (batch: Batch): Batch => {
    ensureBrewableIds(batch.brewable);
    return batch;
};

export const batchesQueryKey = () => ["batches"];
export const loadBatches = async () => (await batchesStorage.list()).map(ensureIds);

export const batchQueryKey = (id: string): [string, string] => ["batch", id];
export const loadBatch = async ({ queryKey: [, id]}: { queryKey: [string, string]}) => {
    const batch = await batchesStorage.get(id);
    return batch ? ensureIds(batch) : batch;
};

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