import {cloneDeep, debounce, get, set} from "lodash";
import {useCallback, useEffect, useMemo, useState} from "react";
import Scalar from "@/model/scalar";
import {scalarFromNumberWithCurrency, scalarFromNumberWithUnit} from "@/utils/formatting";

type UpdateFn = (dot: string, value?: unknown) => void;
type UpdateScalarFn = (dot: string, value: string, lock?: boolean) => void;
type ToggleFn = (dot: string) => void;

export default function useJsonEdit<T>(data: T, onChange: (data: T) => void): [T, UpdateFn, UpdateScalarFn, ToggleFn] {
    const [state, setState] = useState<T>(data);
    useEffect(() => setState(data), [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    /**
     * Updates a property on the JSON object
     */
    const update = useCallback((dot: string, value: unknown) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, value);
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state, debouncedOnChange]);

    /**
     * Updates a property on the JSNO object, handles unit formatting
     */
    const updateScalar = useCallback((dot: string, value: string, lock: boolean = false) => {
        if (state) {
            const prevScalar = get(state, dot) as Scalar;

            if (prevScalar.unit) {
                const newScalar = scalarFromNumberWithUnit(value, prevScalar.unit, lock);
                const newState = set(cloneDeep(state), dot, newScalar);
                setState(newState);
                debouncedOnChange(newState);
            } else if (prevScalar.currency) {
                const newScalar = scalarFromNumberWithCurrency(value, prevScalar.currency, lock);
                const newState = set(cloneDeep(state), dot, newScalar);
                setState(newState);
                debouncedOnChange(newState);
            }
        }
    }, [state, debouncedOnChange])

    /**
     * Toggles a boolean property on the JSON object (ie false to true and vice versa)
     */
    const toggle = useCallback((dot: string) => {
        if (state) {
            const newState = set(cloneDeep(state), dot, !get(state, dot))
            setState(newState);
            debouncedOnChange(newState);
        }
    }, [state, debouncedOnChange]);

    /**
     * replaces nested data of the sub resource
     */
    // const replace = useCallback(<T>(dot: string, value?: T) => {
    //     if (state) {
    //         const newState = set(cloneDeep(state), dot, value)
    //         setState(newState);
    //         debouncedOnChange(newState);
    //     }
    // }, [state, debouncedOnChange]);

    return [state, update, updateScalar, toggle];
}