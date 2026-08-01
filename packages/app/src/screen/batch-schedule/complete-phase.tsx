import {ScreenP} from "@brewdocs.beer/design";
import Modal from "@/component/modal";
import ModalScreen from "@/component/modal/screen";
import useModal from "@/component/modal/useModal";

export type BatchScheduleCompletePhaseProps = {
    label: string;
    onConfirm: () => void;
};

export default function BatchScheduleCompletePhase({ label, onConfirm }: BatchScheduleCompletePhaseProps) {
    const [modalRef, toggle] = useModal();

    return (
        <div className="flex justify-end pt-1 pb-3">
            <button
                type="button"
                aria-label={`Complete ${label}`}
                onClick={toggle}
                className="btn btn-sm btn-primary">
                Complete {label}
            </button>
            <Modal ref={modalRef}>
                <ModalScreen title={`Complete ${label}`} onConfirm={onConfirm}>
                    <ScreenP>This can't be undone.</ScreenP>
                </ModalScreen>
            </Modal>
        </div>
    );
}
