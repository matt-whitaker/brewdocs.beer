import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Scalar} from "@brewdocs.beer/core";
import {useSignals} from "@/providers/signals";
import {scalarFromNumberWithCurrency, scalarFromNumberWithUnit} from "@/utils/formatting";
import {debounce, get, isEqual, setIn} from "@/utils/func";

export type UpdateFn = (dot: string, value?: unknown) => void;
export type UpdateScalarFn = (dot: string, value: string, lock?: boolean) => void;
export type ToggleFn = (dot: string) => void;
export type AddFn = (dot: string, value: unknown) => void;
export type RemoveFn = (dot: string, index: number) => void;
export type MoveFn = (dot: string, from: number, to: number) => void;
export type MutateFn<T> = (fn: (draft: T) => T, immediate?: boolean) => void;

// T is any editable object — a whole Entity (Recipe/Batch) or a sub-object of
// one (e.g. a Brewable, edited by BrewableEdit and merged back on save).
export default function useJsonEdit<T extends object>(data: T, onChange: (data: T) => void): [T, UpdateFn, UpdateScalarFn, ToggleFn, AddFn, RemoveFn, MoveFn, MutateFn<T>] {
    const {beginPendingWrite} = useSignals();
    const [state, setState] = useState<T>(data);

    // the editors below read the draft through this ref rather than closing over
    // `state`, so their identity stays stable across edits — memoized rows
    // downstream aren't invalidated on every keystroke
    const stateRef = useRef(state);
    stateRef.current = state;

    // resync whenever the store emits a batch that actually differs; sibling
    // screens stay mounted in hidden tabs and would otherwise edit from stale
    // copies, clobbering each other's saves
    const pending = useRef(false);
    useEffect(() => {
        if (pending.current) return;
        setState(prev => (isEqual(prev, data) ? prev : data));
    }, [data]);

    const releaseWrite = useRef<(() => void) | null>(null);
    const settle = useCallback((next: T) => {
        pending.current = false;
        const release = releaseWrite.current;
        releaseWrite.current = null;
        return Promise.resolve(onChange(next)).finally(() => release?.());
    }, [onChange]);

    const debouncedSettle = useMemo(() => debounce(settle, 350), [settle]);

    /** applies a new draft; edits that aren't typed character-by-character settle immediately */
    const commit = useCallback((next: T, immediate = false) => {
        setState(next);
        pending.current = true;
        releaseWrite.current ??= beginPendingWrite();
        (immediate ? settle : debouncedSettle)(next);
    }, [settle, debouncedSettle]);

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

    /**
     * Functional whole-draft update — `fn` receives the latest draft and returns
     * the next one. For edits a dot-path can't express (e.g. a map keyed by
     * "equipment:<uuid>", whose colons aren't dot-addressable). Reads the freshest
     * draft via `stateRef`, so a caller doesn't need its own ref to avoid a stale
     * closure, and its identity stays stable like the other editors.
     */
    const mutate = useCallback<MutateFn<T>>((fn, immediate = false) => {
        commit(fn(stateRef.current), immediate);
    }, [commit]);

    return [state, update, updateScalar, toggle, add, remove, move, mutate];
}
