import {forwardRef, PropsWithChildren} from "react";

export * from "./footer";
export * from "./screen";
export * from "./title";
export * from "./useModal";

export type ModalProps = PropsWithChildren & { open?: boolean; };
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(({ children }, ref) => {
    return(
        <dialog className="modal" ref={ref}>
            <div className="modal-box">
                {children}
            </div>
        </dialog>
    );
});

Modal.displayName = "Modal";
