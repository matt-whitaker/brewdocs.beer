import {forwardRef, useCallback, useState} from "react";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {Modal, ModalScreen} from "@/components/modal";

export type QuickMilestoneModalProps = {
    kindOptions: InputSelectOption[];
    currentPhaseLabel?: string;
    onSubmit: (kind: string) => void;
};

function firstValue(options: InputSelectOption[]) {
    const [option] = options;
    return option ? option.value || option.name : "";
}

export const QuickMilestoneModal = forwardRef<HTMLDialogElement, QuickMilestoneModalProps>(
    ({ kindOptions, currentPhaseLabel, onSubmit }, ref) => {
        const [kind, setKind] = useState<string | null>(null);

        const selectedKind = kind ?? firstValue(kindOptions);

        const confirm = useCallback(() => {
            onSubmit(selectedKind);
            setKind(null);
        }, [onSubmit, selectedKind]);

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
                        {currentPhaseLabel
                            ? <p className="text-sm">Recording on <span className="font-bold">{currentPhaseLabel}</span></p>
                            : null}
                    </div>
                </ModalScreen>
            </Modal>
        );
    }
);

QuickMilestoneModal.displayName = "QuickMilestoneModal";
