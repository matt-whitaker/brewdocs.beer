export interface SignalLike<T> {
    when(predicate: (value: T) => boolean, options?: {timeout?: number}): Promise<T>;
}

export interface ClockControl {
    set(ms: number): void;
    advance(ms: number): void;
    reset(): void;
}

declare global {
    interface Window {
        __e2e?: {clock: ClockControl; pendingWrites: SignalLike<number>};
    }
}
