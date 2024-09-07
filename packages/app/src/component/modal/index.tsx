import {forwardRef, PropsWithChildren} from "react";

const Modal = forwardRef(({ children }: PropsWithChildren, ref: any) => {
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