import {RefObject, useCallback, useRef} from "react";

export default function useDrawer(): [RefObject<HTMLInputElement>, () => void] {
    const ref = useRef<HTMLInputElement>(null);
    const closeDrawer = useCallback(() => {
        if (ref && ref.current) {
            ref.current.checked = false
        }
    }, [ref]);
    return [ref, closeDrawer]
}