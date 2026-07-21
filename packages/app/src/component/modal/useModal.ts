import {RefObject, useCallback, useRef} from "react";

export default function useModal(): [RefObject<HTMLDialogElement>, () => void] {
    const ref = useRef<HTMLDialogElement>(null);
    const toggleModal = useCallback(() => {
        if (ref && ref.current) {
            if (ref.current?.open) {
                ref.current.close();
            } else {
                ref.current.showModal();
            }
        }
    }, [ref]);
    return [ref, toggleModal]
}