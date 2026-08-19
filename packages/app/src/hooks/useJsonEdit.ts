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

export default function useJsonEdit<T extends object>(data: T, onChange: (data: T) => void): [T, UpdateFn, UpdateScalarFn, ToggleFn, AddFn, RemoveFn, MoveFn, MutateFn<T>] {
    const {beginPendingWrite} = useSignals();
    const [state, setState] = useState<T>(data);

    const stateRef = useRef(state);
    stateRef.current = state;

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

    const commit = useCallback((next: T, immediate = false) => {
        setState(next);
        pending.current = true;
        releaseWrite.current ??= beginPendingWrite();
        (immediate ? settle : debouncedSettle)(next);
    }, [settle, debouncedSettle]);

    const update = useCallback<UpdateFn>((dot, value) => {
        commit(setIn(stateRef.current, dot, value));
    }, [commit]);

    const updateScalar = useCallback<UpdateScalarFn>((dot, value, lockUnit = false) => {
        const prev = get(stateRef.current, dot) as Scalar;

        if (prev.unit) {
            commit(setIn(stateRef.current, dot, scalarFromNumberWithUnit(value, prev.unit, lockUnit)));
        } else if (prev.currency) {
            commit(setIn(stateRef.current, dot, scalarFromNumberWithCurrency(value, prev.currency, lockUnit)));
        }
    }, [commit]);

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

    const move = useCallback<MoveFn>((dot, from, to) => {
        const list = get(stateRef.current, dot) as unknown[];
        if (to < 0 || to >= list.length) return;
        const next = [...list];
        [next[from], next[to]] = [next[to], next[from]];
        commit(setIn(stateRef.current, dot, next), true);
    }, [commit]);

    const mutate = useCallback<MutateFn<T>>((fn, immediate = false) => {
        commit(fn(stateRef.current), immediate);
    }, [commit]);

    return [state, update, updateScalar, toggle, add, remove, move, mutate];
}
