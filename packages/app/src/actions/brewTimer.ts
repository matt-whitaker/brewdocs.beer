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

export function phaseElapsedSeconds(events: TimerEvent[] | undefined, since: string | undefined, now: Date): number {
    const sinceAt = since ? new Date(since).getTime() : NaN;
    const nowAt = now.getTime();
    if (!events?.length || Number.isNaN(sinceAt) || Number.isNaN(nowAt)) return 0;

    let openedAt: number | null = null;
    let runningMs = 0;

    const close = (endedAt: number) => {
        if (openedAt === null) return;
        runningMs += Math.max(0, Math.min(endedAt, nowAt) - Math.max(openedAt, sinceAt));
        openedAt = null;
    };

    for (const {type, date} of events) {
        const at = new Date(date).getTime();
        if (Number.isNaN(at)) continue;
        if (type === "start" || type === "resume") openedAt ??= at;
        else close(at);
    }

    close(nowAt);

    return Math.max(0, Math.floor(runningMs / 1000));
}
