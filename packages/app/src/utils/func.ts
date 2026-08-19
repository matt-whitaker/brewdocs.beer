/**
 * Structured deep clone — used to detach an editable draft from stored state.
 */
export function cloneDeep<T>(value: T): T {
    return structuredClone(value);
}

export type DebouncedFn<A extends unknown[]> = ((...args: A) => void) & {cancel: () => void};
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): DebouncedFn<A> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const debounced = (...args: A) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

function toSegments(path: string): string[] {
    return path.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean);
}

export function get(obj: unknown, path: string): any {
    let node: any = obj;
    for (const key of toSegments(path)) {
        if (node == null) return undefined;
        node = node[key];
    }
    return node;
}

/**
 * Mutating deep set at a dot/bracket path; creates missing containers along the
 * way (a numeric next segment makes an array, otherwise an object). Mutates obj.
 */
export function set<T extends object>(obj: T, path: string, value: unknown): T {
    const segments = toSegments(path);
    let node: any = obj;
    for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        if (typeof node[key] !== "object" || node[key] === null) {
            node[key] = /^\d+$/.test(segments[i + 1]) ? [] : {};
        }
        node = node[key];
    }
    node[segments[segments.length - 1]] = value;
    return obj;
}

function shallowClone<T>(node: T): T {
    return (Array.isArray(node) ? [...node] : {...node}) as T;
}

/**
 * Immutable deep set: returns a new object, cloning only the nodes along the
 * path and sharing the rest — safe for React state (the mutating twin of set).
 */
export function setIn<T extends object>(obj: T, path: string, value: unknown): T {
    const segments = toSegments(path);
    if (!segments.length) return obj;

    const next = shallowClone(obj) as any;
    let cursor = next;

    for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        const child = cursor[key];
        cursor[key] = child == null
            ? (/^\d+$/.test(segments[i + 1]) ? [] : {})
            : shallowClone(child);
        cursor = cursor[key];
    }

    cursor[segments[segments.length - 1]] = value;
    return next as T;
}

/**
 * Shallow copy of obj dropping every entry whose value satisfies the predicate.
 */
export function omitBy<T extends object>(obj: T, predicate: (value: T[keyof T]) => boolean): Partial<T> {
    const result: Partial<T> = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
        if (!predicate(obj[key])) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * lodash-style emptiness: null/undefined, "", [], and empty Map/Set/object are
 * empty — and so are primitives (numbers, booleans), which have no length.
 */
export function isEmpty(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return true;
}

/**
 * Deep equality over JSON-ish values (plain objects, arrays, primitives)
 */
export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual((a as any)[key], (b as any)[key]));
}

export function groupBy<T>(items: readonly T[], key: keyof T): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
        const group = String(item[key]);
        (groups[group] ??= []).push(item);
    }
    return groups;
}

export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
    const setB = new Set(b);
    return a.filter(item => setB.has(item));
}

export type FilterFn<T> = (item: T) => boolean;
export type PipeableFn<T> = (item: T) => T;

export const pipe = <T>(...fns: PipeableFn<T>[]) => (x: T): T => fns.reduce((acc, fn) => fn(acc), x);