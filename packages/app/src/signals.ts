export interface Signal<T> {
    get(): T;
    subscribe(handler: (value: T) => void): () => void;
    when(predicate: (value: T) => boolean, options?: {timeout?: number}): Promise<T>;
}

interface WritableSignal<T> extends Signal<T> {
    set(value: T): void;
}

export function createSignal<T>(initial: T): WritableSignal<T> {
    let value = initial;
    const handlers = new Set<(value: T) => void>();

    const subscribe = (handler: (value: T) => void) => {
        handlers.add(handler);
        return () => handlers.delete(handler);
    };

    return {
        get: () => value,
        set: (next: T) => {
            if (next === value) return;
            value = next;
            [...handlers].forEach((handler) => handler(value));
        },
        subscribe,
        when: (predicate, options) => new Promise<T>((resolve, reject) => {
            if (predicate(value)) return resolve(value);
            let timer: ReturnType<typeof setTimeout> | undefined;
            const unsubscribe = subscribe((next) => {
                if (!predicate(next)) return;
                if (timer) clearTimeout(timer);
                unsubscribe();
                resolve(next);
            });
            if (options?.timeout) {
                timer = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`signal stayed unsatisfied for ${options.timeout}ms (value: ${JSON.stringify(value)})`));
                }, options.timeout);
            }
        }),
    };
}

export const pendingWrites = createSignal(0);

export function beginPendingWrite(): () => void {
    pendingWrites.set(pendingWrites.get() + 1);
    let released = false;
    return () => {
        if (released) return;
        released = true;
        pendingWrites.set(Math.max(0, pendingWrites.get() - 1));
    };
}

export function trackWrite<T>(write: () => Promise<T>): Promise<T> {
    const release = beginPendingWrite();
    return write().finally(release);
}


export interface Signals {
    pendingWrites: Signal<number>;
    beginPendingWrite(): () => void;
}

export const signals: Signals = {pendingWrites, beginPendingWrite};
