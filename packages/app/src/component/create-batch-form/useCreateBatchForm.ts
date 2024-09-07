import {useMemo, useState} from "react";
import Batch from "@/model/batch";
import {omitBy, isEmpty} from "lodash";

export type CreateBatchForm = Pick<Batch, "name"|"brewDate">
export default function useCreatBatchForm(defaultName: string) {
    const [state, setState] = useState<CreateBatchForm>({ name: "", brewDate: "" });
    const finalState = useMemo(() => ({
        name: defaultName,
        date: "",
        ...omitBy(state, isEmpty)
    } as CreateBatchForm), [defaultName, state]);

    return [
        state,
        setState,
        finalState
    ]
}