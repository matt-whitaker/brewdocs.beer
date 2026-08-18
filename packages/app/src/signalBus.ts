declare global {
    interface Window {
        __brewdocsPendingWrites?: number;
    }
}

export const PENDING_WRITES = "pendingWrites";

type SignalHandler = () => void;

const handlers = new Map<string, Set<SignalHandler>>();

let count = 0;

export function emit(topic: string): void {
    handlers.get(topic)?.forEach((handler) => handler());
}

export function on(topic: string, handler: SignalHandler): () => void {
    const topicHandlers = handlers.get(topic) ?? new Set<SignalHandler>();

    topicHandlers.add(handler);
    handlers.set(topic, topicHandlers);

    return () => {
        topicHandlers.delete(handler);
        if (!topicHandlers.size) handlers.delete(topic);
    };
}

export function pendingWrites(): number {
    return count;
}

function publishPendingWrites(): void {
    window.__brewdocsPendingWrites = count;
    emit(PENDING_WRITES);
}

export function startPendingWrite(): void {
    count += 1;
    publishPendingWrites();
}

export function endPendingWrite(): void {
    count = Math.max(0, count - 1);
    publishPendingWrites();
}

publishPendingWrites();
