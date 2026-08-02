import {forwardRef, useCallback, useState} from "react";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {InputText} from "@/components/input-text";
import {Modal, ModalScreen} from "@/components/modal";

export type QuickMilestoneModalProps = {
    kindOptions: InputSelectOption[];
    parameterOptions?: Record<string, InputSelectOption[]>;
    phaseLabel: string;
    onSubmit: (kind: string, value: string, parameter?: string) => void;
};

function firstValue(options: InputSelectOption[]) {
    const [option] = options;
    return option ? option.value || option.name : "";
}

export const QuickMilestoneModal = forwardRef<HTMLDialogElement, QuickMilestoneModalProps>(
    ({ kindOptions, parameterOptions, phaseLabel, onSubmit }, ref) => {
        const [kind, setKind] = useState<string | null>(null);
        const [parameter, setParameter] = useState<string | null>(null);
        const [value, setValue] = useState("");

        const selectedKind = kind ?? firstValue(kindOptions);
        const parametersForKind = parameterOptions?.[selectedKind];
        const selectedParameter = parametersForKind
            ? parameter ?? firstValue(parametersForKind)
            : undefined;

        const confirm = useCallback(() => {
            onSubmit(selectedKind, value, selectedParameter);
            setKind(null);
            setParameter(null);
            setValue("");
        }, [onSubmit, selectedKind, selectedParameter, value]);

        return (
            <Modal ref={ref}>
                <ModalScreen title="Quick reading" onConfirm={confirm}>
                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1">
                            <span className="text-sm font-bold">Reading</span>
                            <InputSelect
                                label="Reading kind"
                                className="w-full"
                                data={kindOptions}
                                value={selectedKind}
                                onChange={setKind} />
                        </div>
                        {parametersForKind ? (
                            <div className="grid gap-1">
                                <span className="text-sm font-bold">Measurement</span>
                                <InputSelect
                                    label="Reading measurement"
                                    className="w-full"
                                    data={parametersForKind}
                                    value={selectedParameter ?? null}
                                    onChange={setParameter} />
                            </div>
                        ) : null}
                        <div className="grid gap-1">
                            <span className="text-sm font-bold">Value</span>
                            <InputText
                                label="Reading value"
                                className="w-full"
                                value={value}
                                onChange={setValue} />
                        </div>
                        <p className="text-sm opacity-70">Recording on {phaseLabel}</p>
                    </div>
                </ModalScreen>
            </Modal>
        );
    }
);

QuickMilestoneModal.displayName = "QuickMilestoneModal";
