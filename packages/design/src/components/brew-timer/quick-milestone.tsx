import {forwardRef, useCallback, useState} from "react";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {Modal, ModalScreen} from "@/components/modal";

export type QuickMilestoneModalProps = {
    kindOptions: InputSelectOption[];
    phaseOptions: InputSelectOption[];
    onSubmit: (kind: string, phaseId: string) => void;
};

function firstValue(options: InputSelectOption[]) {
    const [option] = options;
    return option ? option.value || option.name : "";
}

export const QuickMilestoneModal = forwardRef<HTMLDialogElement, QuickMilestoneModalProps>(
    ({ kindOptions, phaseOptions, onSubmit }, ref) => {
        const [kind, setKind] = useState<string | null>(null);
        const [phaseId, setPhaseId] = useState<string | null>(null);

        const selectedKind = kind ?? firstValue(kindOptions);
        const selectedPhaseId = phaseId ?? firstValue(phaseOptions);

        const confirm = useCallback(() => {
            onSubmit(selectedKind, selectedPhaseId);
            setKind(null);
            setPhaseId(null);
        }, [onSubmit, selectedKind, selectedPhaseId]);

        return (
            <Modal ref={ref}>
                <ModalScreen title="Quick milestone" onConfirm={confirm}>
                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1">
                            <span className="text-sm font-bold">Milestone</span>
                            <InputSelect
                                label="Milestone kind"
                                className="w-full"
                                data={kindOptions}
                                value={selectedKind}
                                onChange={setKind} />
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-bold">Phase</span>
                            <InputSelect
                                label="Milestone phase"
                                className="w-full"
                                data={phaseOptions}
                                value={selectedPhaseId}
                                onChange={setPhaseId} />
                        </div>
                    </div>
                </ModalScreen>
            </Modal>
        );
    }
);

QuickMilestoneModal.displayName = "QuickMilestoneModal";
