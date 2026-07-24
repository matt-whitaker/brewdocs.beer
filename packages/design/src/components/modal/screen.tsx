import {PropsWithChildren, ReactNode} from "react";
import {ModalFooter} from "./footer";
import {ModalTitle} from "./title";

export type ModalScreenProps = PropsWithChildren & {
    title: ReactNode;
    onConfirm?: () => void;
};

/**
 * Scaffold for a modal's content — the body a route hands to <Action modalContent>.
 * Provides the standard title + confirm footer; the caller supplies the form body.
 * Close is native to ModalFooter's method="dialog" form, so no close handler is
 * needed. See screen/create-batch and screen/edit-recipe for the pattern.
 */
export function ModalScreen({ title, onConfirm, children }: ModalScreenProps) {
    return (
        <>
            <ModalTitle>{title}</ModalTitle>
            {children}
            <ModalFooter confirm={onConfirm} />
        </>
    );
}
