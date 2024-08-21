import {useCallback, useState} from "react";

export default function useButtonChecklist(defaultChecked: Record<string, boolean>) {
    const [checked, setChecked] = useState<Record<string, boolean>>(defaultChecked);

    const updateChecked = useCallback((name: string) => {
        setChecked({ ...checked, [name]: !checked[name] });
    }, [checked, setChecked])

    return [checked, updateChecked];
}