import {useEffect, useState} from "react";
import {now, onTick} from "@/clock";
import {elapsedSeconds, isRunning, runningSecondsSince} from "@/model/timer";
import {TimerEvent} from "@/model/timer";

const secondsNow = (events?: TimerEvent[], since?: Date) => since
    ? runningSecondsSince(events, since, now())
    : elapsedSeconds(events, now());

export default function useElapsedSeconds(events?: TimerEvent[], since?: Date): number {
    const [seconds, setSeconds] = useState(() => secondsNow(events, since));
    const running = isRunning(events);

    useEffect(() => {
        const sync = () => setSeconds(secondsNow(events, since));

        sync();

        if (!running) return;

        const untick = onTick(sync);
        document.addEventListener("visibilitychange", sync);
        window.addEventListener("focus", sync);

        return () => {
            untick();
            document.removeEventListener("visibilitychange", sync);
            window.removeEventListener("focus", sync);
        };
    }, [events, running, since]);

    return seconds;
}
