import classNames from "classnames";
import {ReactNode} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {ScreenP, Trash} from "@brewdocs.beer/design";
import Modal from "@/component/modal";
import ModalScreen from "@/component/modal/screen";
import useModal from "@/component/modal/useModal";

export type ConfirmDeleteButtonProps = PropsWithClass & {
    title: ReactNode;
    label: string;
    onConfirm: () => void;
};

export default function ConfirmDeleteButton({ title, label, onConfirm, className }: ConfirmDeleteButtonProps) {
    const [modalRef, toggle] = useModal();

    return (
        <>
            <button
                type="button"
                aria-label={label}
                onClick={toggle}
                className={classNames("btn btn-xs btn-ghost text-error absolute top-1.5 right-1.5", [className])}>
                <Trash className="w-4" />
            </button>
            <Modal ref={modalRef}>
                <ModalScreen title={title} onConfirm={onConfirm}>
                    <ScreenP>This can't be undone.</ScreenP>
                </ModalScreen>
            </Modal>
        </>
    );
}
