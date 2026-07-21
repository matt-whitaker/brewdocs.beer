import {forwardRef, PropsWithChildren} from "react";

export type ModalProps = PropsWithChildren & { open?: boolean; };
const Modal = forwardRef<HTMLDialogElement, ModalProps>(({ children }, ref) => {
    return(
        <dialog className="modal" ref={ref}>
            <div className="modal-box">
                {children}
            </div>
        </dialog>
    );
});

Modal.displayName = "Modal";
export default Modal;