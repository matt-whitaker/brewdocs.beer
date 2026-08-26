// Every type in this file is documented field by field in ../../MODELS.md — read there for what each means.

export type TimerEventType = "start" | "pause" | "resume" | "stop";

export interface TimerEvent {
    type: TimerEventType;
    date: string;
}

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

export function sessionStartDate(events?: TimerEvent[]): Date | undefined {
    const firstStart = events?.find(({type}) => type === "start");
    if (!firstStart) return undefined;

    const startedAt = new Date(firstStart.date);
    return Number.isNaN(startedAt.getTime()) ? undefined : startedAt;
}

type PausedSpan = [from: number, to: number];

function pausedSpans(events: TimerEvent[], openSpanEndsAt: number): PausedSpan[] {
    const spans: PausedSpan[] = [];
    let pausedAt: number | undefined;

    for (const {type, date} of events) {
        const at = new Date(date).getTime();
        if (Number.isNaN(at)) continue;

        if (type === "pause") {
            pausedAt ??= at;
        } else if (pausedAt !== undefined && (type === "resume" || type === "start")) {
            spans.push([pausedAt, at]);
            pausedAt = undefined;
        }
    }

    if (pausedAt !== undefined) spans.push([pausedAt, openSpanEndsAt]);
    return spans;
}

const overlapMs = ([from, to]: PausedSpan, windowStart: number, windowEnd: number) =>
    Math.max(0, Math.min(to, windowEnd) - Math.max(from, windowStart));

export function runningSecondsSince(events: TimerEvent[] | undefined, since: Date, now: Date): number {
    const firstStart = events?.find(({type}) => type === "start");
    const last = events?.at(-1);
    if (!events || !firstStart || !last) return 0;

    const startedAt = new Date(firstStart.date).getTime();
    const sinceAt = since.getTime();
    const endedAt = isRunning(events) ? now.getTime() : new Date(last.date).getTime();
    if (Number.isNaN(startedAt) || Number.isNaN(sinceAt) || Number.isNaN(endedAt)) return 0;

    const windowStart = Math.max(startedAt, sinceAt);
    if (endedAt <= windowStart) return 0;

    const paused = pausedSpans(events, endedAt)
        .reduce((total, span) => total + overlapMs(span, windowStart, endedAt), 0);

    return Math.max(0, Math.floor((endedAt - windowStart - paused) / 1000));
}
