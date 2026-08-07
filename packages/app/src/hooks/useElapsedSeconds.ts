import {useCallback, useEffect, useState} from "react";
import {elapsedSeconds, isRunning, phaseElapsedSeconds} from "@/actions/brewTimer";
import {TimerEvent} from "@/model/timer";

function useTickingSeconds(events: TimerEvent[] | undefined, compute: (now: Date) => number): number {
    const [seconds, setSeconds] = useState(() => compute(new Date()));
    const running = isRunning(events);

    useEffect(() => {
        const sync = () => setSeconds(compute(new Date()));

        sync();

        if (!running) return;

        const interval = window.setInterval(sync, 1000);
        document.addEventListener("visibilitychange", sync);
        window.addEventListener("focus", sync);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", sync);
            window.removeEventListener("focus", sync);
        };
    }, [compute, running]);

    return seconds;
}

export default function useElapsedSeconds(events?: TimerEvent[]): number {
    return useTickingSeconds(events, useCallback((now: Date) => elapsedSeconds(events, now), [events]));
}

export function usePhaseElapsedSeconds(events: TimerEvent[] | undefined, since: string | undefined): number {
    return useTickingSeconds(events, useCallback((now: Date) => phaseElapsedSeconds(events, since, now), [events, since]));
}
