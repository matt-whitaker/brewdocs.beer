import {ComponentType, ReactNode, Suspense} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import Modal from "@/component/modal";
import useModal from "@/component/modal/useModal";

export type ActionProps = {
    /** button text */
    label: ReactNode;
    /** optional leading icon component (e.g. Plus, Pencil) */
    icon?: ComponentType<PropsWithClass>;
    /** click handler for a modal-less action (ignored when `modalContent` is set) */
    onClick?: () => void;
    /**
     * opt-in modal content. When present, the button opens it instead of calling
     * onClick. Action owns the dialog ref (useModal) and the Suspense boundary;
     * the content is plain config — only Modal needs the ref, and the footer's
     * method="dialog" form dismisses natively, so the content needs no close handle.
     */
    modalContent?: ReactNode;
};

/**
 * A tab-row action button (see PanelSwitcherContent `actions`). Renders a ghost
 * button; if given `modal`, it also owns a dialog the button toggles.
 */
export default function Action({ label, icon: Icon, onClick, modalContent }: ActionProps) {
    const [modalRef, toggle] = useModal();
    const hasModal = modalContent != null;

    return (
        <>
            <button className="btn btn-ghost btn-sm text-primary" onClick={hasModal ? toggle : onClick}>
                {Icon && <Icon className="w-4 -ml-1" />} {label}
            </button>
            {hasModal && (
                <Modal ref={modalRef}>
                    {/* content data-reads sit behind a local boundary so a suspend
                        never blanks the always-visible button; the modal is closed
                        at first paint, so a null fallback is invisible */}
                    <Suspense fallback={null}>
                        {modalContent}
                    </Suspense>
                </Modal>
            )}
        </>
    );
}
