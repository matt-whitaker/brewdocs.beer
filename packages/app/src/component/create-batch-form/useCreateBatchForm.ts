import {useMemo, useState} from "react";
import Batch from "@/model/batch";
import {omitBy, isEmpty} from "lodash";

export type CreateBatchState = Pick<Batch, "name"|"brewDate">
export default function useCreatBatchForm(defaultName: string): [CreateBatchState, (state: CreateBatchState) => void, CreateBatchState] {
    const [state, setState] = useState<CreateBatchState>({ name: "", brewDate: "" });
    const finalState = useMemo<CreateBatchState>(() => ({
        name: defaultName,
        brewDate: "",
        ...omitBy(state, isEmpty)
    }), [defaultName, state]);

    return [
        state,
        setState,
        finalState
    ]
}