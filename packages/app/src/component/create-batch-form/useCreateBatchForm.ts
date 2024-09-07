import {useState} from "react";
import Batch from "@/model/batch";
import {omitBy, isEmpty} from "lodash";

export type CreateBatchForm = Pick<Batch, "name"|"brewDate">
export default function useCreatBatchForm(defaultName: string) {
    const [state, setState] = useState<CreateBatchForm>({ name: "", brewDate: "" });

    return [
        state,
        setState,
        {
            name: defaultName,
            date: "",
            ...omitBy(state, isEmpty)
        } as CreateBatchForm
    ]
}