import {forwardRef} from "react";

const Modal = forwardRef(({ children }, ref) => {
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