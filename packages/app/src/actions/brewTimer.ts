import {TimerEvent} from "@/model/timer";

export function isRunning(events?: TimerEvent[]): boolean {
    const last = events?.at(-1);
    return last?.type === "start" || last?.type === "resume";
}

export function elapsedSeconds(events: TimerEvent[] | undefined, now: Date): number {
    const firstStart = events?.find(({type}) => type === "start");
    const last = events?.at(-1);
    if (!firstStart || !last) return 0;

    const startedAt = new Date(firstStart.date).getTime();
    const endedAt = isRunning(events) ? now.getTime() : new Date(last.date).getTime();
    if (Number.isNaN(startedAt) || Number.isNaN(endedAt)) return 0;

    return Math.max(0, Math.floor((endedAt - startedAt) / 1000));
}
