import {TimerEvent} from "@/model/timer";

export function isRunning(events?: TimerEvent[]): boolean {
    const last = events?.at(-1);
    return last?.type === "start" || last?.type === "resume";
}

export function elapsedSeconds(events: TimerEvent[] | undefined, now: Date): number {
    if (!events?.length) return 0;

    let elapsed = 0;
    let runningSince: number | undefined;

    events.forEach(({type, date}) => {
        const at = new Date(date).getTime();
        if (Number.isNaN(at)) return;

        if (type === "start" || type === "resume") {
            runningSince ??= at;
            return;
        }

        if (runningSince !== undefined) {
            elapsed += at - runningSince;
            runningSince = undefined;
        }
    });

    if (runningSince !== undefined) elapsed += now.getTime() - runningSince;

    return Math.max(0, Math.floor(elapsed / 1000));
}
