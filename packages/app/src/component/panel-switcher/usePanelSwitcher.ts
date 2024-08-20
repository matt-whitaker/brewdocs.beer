import {ChangeEventHandler, useCallback, useState} from "react";
import {eventValue} from "@/utils/fn";

export default function usePanelSwitcher(defaultTitle: string): [string, ChangeEventHandler] {
    const [active, setActive] = useState(defaultTitle);
    const change = useCallback(eventValue((title: string) => setActive(title)), []);
    return [
        active,
        change,
    ];
}