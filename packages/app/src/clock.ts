const TICK_MS = 1000;

type TickHandler = () => void;

export interface ClockControl {
    set(ms: number): void;
    advance(ms: number): void;
    reset(): void;
}

const handlers = new Set<TickHandler>();

let mockedAt: number | undefined;
let interval: number | undefined;

const fireTick = () => [...handlers].forEach((handler) => handler());

function startTicking() {
    if (interval !== undefined || mockedAt !== undefined || !handlers.size) return;
    interval = window.setInterval(fireTick, TICK_MS);
}

function stopTicking() {
    if (interval === undefined) return;
    window.clearInterval(interval);
    interval = undefined;
}

export function now(): Date {
    return mockedAt === undefined ? new Date() : new Date(mockedAt);
}

export function onTick(handler: TickHandler): () => void {
    handlers.add(handler);
    startTicking();

    return () => {
        handlers.delete(handler);
        if (!handlers.size) stopTicking();
    };
}

function set(ms: number) {
    mockedAt = ms;
    stopTicking();
    fireTick();
}

function advance(ms: number) {
    set((mockedAt ?? Date.now()) + ms);
}

function reset() {
    mockedAt = undefined;
    startTicking();
    fireTick();
}

declare global {
    interface Window {
        __clock?: ClockControl;
    }
}

window.__clock = {set, advance, reset};
