const TICK_MS = 1000;

type TickHandler = () => void;

export interface ClockControl {
    set(ms: number): void;
    advance(ms: number): void;
    reset(): void;
}

export interface Clock {
    now(): Date;
    onTick(handler: TickHandler): () => void;
    control: ClockControl;
}

export function createClock(): Clock {
    const handlers = new Set<TickHandler>();
    let mockedAt: number | undefined;
    let interval: number | undefined;

    const fireTick = () => [...handlers].forEach((handler) => handler());

    const startTicking = () => {
        if (interval !== undefined || mockedAt !== undefined || !handlers.size) return;
        interval = window.setInterval(fireTick, TICK_MS);
    };

    const stopTicking = () => {
        if (interval === undefined) return;
        window.clearInterval(interval);
        interval = undefined;
    };

    const set = (ms: number) => {
        mockedAt = ms;
        stopTicking();
        fireTick();
    };

    return {
        now: () => (mockedAt === undefined ? new Date() : new Date(mockedAt)),
        onTick: (handler) => {
            handlers.add(handler);
            startTicking();
            return () => {
                handlers.delete(handler);
                if (!handlers.size) stopTicking();
            };
        },
        control: {
            set,
            advance: (ms) => set((mockedAt ?? Date.now()) + ms),
            reset: () => {
                mockedAt = undefined;
                startTicking();
                fireTick();
            },
        },
    };
}

const clock = createClock();
export default clock;
