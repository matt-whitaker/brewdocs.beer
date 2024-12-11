import {MutableRefObject, useCallback, useRef} from "react";

export default function useModal(): [MutableRefObject<HTMLDialogElement|undefined>, () => void] {
    const ref = useRef<HTMLDialogElement>();
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