import Batch from "@/model/batch";
import State from "@/state/state";
import {useEffect, useState} from "react";

export type BatchesTuple = [Batch[], Map<string, Batch>]|[null, null];

export function useBatches(): BatchesTuple {
    const [state, setState] = useState<BatchesTuple>(batchesState.current || [null, null]);

    useEffect(() => {
        batchesState.subscribe((newState) => setState(newState));
        batchesState.load();
    }, []);

    return state as BatchesTuple;
}

export class BatchesState extends State<BatchesTuple> {
    load() {
        import("@/data/batches").then(({ default: batches }) => batches)
            .then(batches => {
                const index = batches.reduce((m, r) => m.set(r.id, r), new Map());
                this._subject.next([batches, index]);
            });
    }

    update(batch: Batch) {
        // do update

        // reload from storage
        this.load();
    }
}

const batchesState = new BatchesState([null, null]);
export default batchesState;