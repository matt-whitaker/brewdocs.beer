import {MutableRefObject, useCallback, useRef} from "react";

export default function useDrawer(): [MutableRefObject<HTMLInputElement|undefined>, () => void] {
    const ref = useRef<HTMLInputElement>();
    const closeDrawer = useCallback(() => {
        if (ref && ref.current) {
            ref.current.checked = false
        }
    }, [ref]);
    return [ref, closeDrawer]
}