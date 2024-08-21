import {useCallback, useEffect, useState} from "react";

export default function useButtonChecklist(defaultChecked: Record<string, boolean>) {
    const [checked, setChecked] = useState<Record<string, boolean>>(defaultChecked);
    useEffect(() => setChecked(defaultChecked), [defaultChecked]);

    const updateChecked = useCallback((name: string) => {
        setChecked({ ...checked, [name]: !checked[name] });
    }, [checked, setChecked])

    return [checked, updateChecked];
}