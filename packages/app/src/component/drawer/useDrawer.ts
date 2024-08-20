import {Ref, useCallback, useRef} from "react";

export default function useDrawer(): [Ref<HTMLInputElement>, () => void] {
    const ref = useRef<HTMLInputElement>();
    const closeDrawer = useCallback(() => ref.current.checked = false, [ref]);
    return [ref, closeDrawer]
}