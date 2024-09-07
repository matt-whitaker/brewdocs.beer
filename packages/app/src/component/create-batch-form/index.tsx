import {useCallback, useState} from "react";
import {eventValue} from "@/utils/fn";
import {CreateBatchForm} from "@/component/create-batch-form/useCreateBatchForm";

export type CreatBatchFormProps = {
    defaultName: string;
    inputs: CreateBatchForm;
    change: (inputs: CreateBatchForm) => void;
}
export default function CreateBatchForm({ defaultName, inputs, change }: CreatBatchFormProps) {
    const onChangeName = useCallback(eventValue((name: string) => change({ ...inputs, name })), [change]);
    return (
        <span>
            <label>
                Batch name:
                <input
                    onChange={onChangeName}
                    value={inputs.name}
                    type="text"
                    className="ml-2 mt-2 input input-primary input-sm"
                    placeholder={defaultName} />
            </label>
        </span>
    )
}