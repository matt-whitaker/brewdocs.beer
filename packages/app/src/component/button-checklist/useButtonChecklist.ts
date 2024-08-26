import {useCallback, useEffect, useMemo, useState} from "react";
import {debounce} from "lodash";

export default function useButtonChecklist(
    defaultChecked: Record<string, boolean> = {},
    onChange: (checked: Record<string, boolean>) => void
): [Record<string, boolean>, (name: string) => void] {
    const [checked, setChecked] = useState<Record<string, boolean>>(defaultChecked);
    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    useEffect(() => setChecked(defaultChecked), [defaultChecked]);

    const toggle = useCallback((name: string) => {
        const updated = { ...checked, [name]: !checked[name] };
        setChecked(updated);
        debouncedOnChange(updated);
    }, [checked, setChecked])

    return [checked, toggle];
}