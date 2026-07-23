import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Entity, Scalar} from "@brewdocs.beer/core";
import {scalarFromNumberWithCurrency, scalarFromNumberWithUnit} from "@/utils/formatting";
import {debounce, get, isEqual, setIn} from "@/utils/func";

export type UpdateFn = (dot: string, value?: unknown) => void;
export type UpdateScalarFn = (dot: string, value: string, lock?: boolean) => void;
export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: unknown) => void;
export type RemoveFn = (dot: string, index: number) => void;
export type MoveFn = (dot: string, from: number, to: number) => void;

export default function useJsonEdit<T extends Entity>(data: T, onChange: (data: T) => void): [T, UpdateFn, UpdateScalarFn, ToggleFn, AddFn, RemoveFn, MoveFn] {
    const [state, setState] = useState<T>(data);

    // the editors below read the draft through this ref rather than closing over
    // `state`, so their identity stays stable across edits — memoized rows
    // downstream aren't invalidated on every keystroke
    const stateRef = useRef(state);
    stateRef.current = state;

    // resync whenever the store emits a batch that actually differs; sibling
    // screens stay mounted in hidden tabs and would otherwise edit from stale
    // copies, clobbering each other's saves
    useEffect(() => {
        setState(prev => (isEqual(prev, data) ? prev : data));
    }, [data]);

    const debouncedOnChange = useMemo(() => debounce(onChange, 350), [onChange]);

    /** applies a new draft; edits that aren't typed character-by-character settle immediately */
    const commit = useCallback((next: T, immediate = false) => {
        setState(next);
        (immediate ? onChange : debouncedOnChange)(next);
    }, [onChange, debouncedOnChange]);

    /**
     * Updates a property on the JSON object
     */
    const update = useCallback<UpdateFn>((dot, value) => {
        commit(setIn(stateRef.current, dot, value));
    }, [commit]);

    /**
     * Updates a property on the JSON object, handles unit formatting
     */
    const updateScalar = useCallback<UpdateScalarFn>((dot, value, lockUnit = false) => {
        const prev = get(stateRef.current, dot) as Scalar;

        if (prev.unit) {
            commit(setIn(stateRef.current, dot, scalarFromNumberWithUnit(value, prev.unit, lockUnit)));
        } else if (prev.currency) {
            commit(setIn(stateRef.current, dot, scalarFromNumberWithCurrency(value, prev.currency, lockUnit)));
        }
    }, [commit]);

    /**
     * Toggles a boolean property on the JSON object (ie false to true and vice versa)
     */
    const toggle = useCallback<ToggleFn>((dot) => {
        commit(setIn(stateRef.current, dot, !get(stateRef.current, dot)), true);
    }, [commit]);

    const add = useCallback<AddFn>((dot, value) => {
        const list = get(stateRef.current, dot) as unknown[];
        commit(setIn(stateRef.current, dot, [...list, value]), true);
    }, [commit]);

    const remove = useCallback<RemoveFn>((dot, index) => {
        const list = get(stateRef.current, dot) as unknown[];
        commit(setIn(stateRef.current, dot, list.filter((_, i) => i !== index)), true);
    }, [commit]);

    /**
     * Swaps two items in a list — used for reordering (e.g. drag-free "move up"/"move down" controls)
     */
    const move = useCallback<MoveFn>((dot, from, to) => {
        const list = get(stateRef.current, dot) as unknown[];
        if (to < 0 || to >= list.length) return;
        const next = [...list];
        [next[from], next[to]] = [next[to], next[from]];
        commit(setIn(stateRef.current, dot, next), true);
    }, [commit]);

    return [state, update, updateScalar, toggle, add, remove, move];
}
