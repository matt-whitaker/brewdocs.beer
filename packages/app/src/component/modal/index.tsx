import {forwardRef, PropsWithChildren} from "react";

export type ModalProps = PropsWithChildren & { open?: boolean; }
const Modal = forwardRef(({ children }: ModalProps, ref: any) => {
    return(
        <dialog className="modal" ref={ref}>
            <div className="modal-box">
                {children}
            </div>
        </dialog>
    )
});

Modal.displayName = "Modal";
export default Modal;