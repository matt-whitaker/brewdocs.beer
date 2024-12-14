import {cloneDeep, debounce, get, set} from "lodash";
import {useCallback, useEffect, useMemo, useState} from "react";
import Scalar from "@/model/scalar";
import {scalarFromNumberWithCurrency, scalarFromNumberWithUnit} from "@/utils/formatting";
import {Entity} from "@brewdocs.beer/core";

export type UpdateFn = (dot: string, value?: unknown) => void;
export type UpdateScalarFn = (dot: string, value: string, lock?: boolean) => void;
export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: any) => void;
export type RemoveFn = (dot: string, index: number) => void;

export default function useJsonEdit<T extends Entity>(data: T, onChange: (data: T) => void): [T, UpdateFn, UpdateScalarFn, ToggleFn, AddFn, RemoveFn] {
    const [state, setState] = useState<T>(data);
    useEffect(() => {
        if (data.id !== state.id) {
            setState(data);
        }
    }, [state, data]);
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
     * Updates a property on the JSON object, handles unit formatting
     */
    const updateScalar = useCallback((dot: string, value: string, lockUnit: boolean = false) => {
        if (state) {
            const prevScalar = get(state, dot) as Scalar;

            if (prevScalar.unit) {
                const newScalar = scalarFromNumberWithUnit(value, prevScalar.unit, lockUnit);
                const newState = set(cloneDeep(state), dot, newScalar);
                setState(newState);
                debouncedOnChange(newState);
            } else if (prevScalar.currency) {
                const newScalar = scalarFromNumberWithCurrency(value, prevScalar.currency, lockUnit);
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
            onChange(newState);
        }
    }, [state, onChange]);

    const add = useCallback((dot: string, value: T) => {
        if (state) {
            const newState = cloneDeep(state);
            get(newState, dot).push(value);
            setState(newState);
            onChange(newState);
        }
    }, [state, onChange]);

    const remove = useCallback((dot: string, index: number) => {
        if (state) {
            const newState = cloneDeep(state);
            get(newState, dot).splice(index, 1);
            setState(newState);
            onChange(newState);
        }
    }, [state, onChange]);

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

    return [state, update, updateScalar, toggle, add, remove];
}