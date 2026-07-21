import {eventValue} from "@brewdocs.beer/core";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";

export type CreatBatchFormProps = {
    defaultName: string;
    inputs: CreateBatchState;
    change: (inputs: CreateBatchState) => void;
};
export default function CreateBatchForm({ defaultName, inputs, change }: CreatBatchFormProps) {
    // plain DOM input, so a stable handler identity buys nothing — and `inputs`
    // changes every keystroke anyway, so useCallback never memoized here
    const onChange = eventValue((name: string) => change({ ...inputs, name }));
    return (
        <span>
            <label>
                Batch name:
                <input
                    onChange={onChange}
                    value={inputs.name}
                    type="text"
                    className="xs:ml-2 mt-2 input input-primary input-sm"
                    placeholder={defaultName} />
            </label>
        </span>
    );
}