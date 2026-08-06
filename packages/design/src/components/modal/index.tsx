import {forwardRef, PropsWithChildren} from "react";
import {createPortal} from "react-dom";

export * from "./footer";
export * from "./screen";
export * from "./title";
export * from "./useModal";

export type ModalProps = PropsWithChildren & { open?: boolean; };
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(({ children }, ref) => {
    return createPortal(
        <dialog className="modal" ref={ref}>
            <div className="modal-box">
                {children}
            </div>
        </dialog>,
        document.body
    );
});

Modal.displayName = "Modal";
