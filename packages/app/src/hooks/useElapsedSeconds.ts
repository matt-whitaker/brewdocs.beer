import {useEffect, useState} from "react";
import {elapsedSeconds, isRunning, runningSecondsSince} from "@/model/timer";
import {TimerEvent} from "@/model/timer";

const secondsNow = (events?: TimerEvent[], since?: Date) => since
    ? runningSecondsSince(events, since, new Date())
    : elapsedSeconds(events, new Date());

export default function useElapsedSeconds(events?: TimerEvent[], since?: Date): number {
    const [seconds, setSeconds] = useState(() => secondsNow(events, since));
    const running = isRunning(events);

    useEffect(() => {
        const sync = () => setSeconds(secondsNow(events, since));

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
    }, [events, running, since]);

    return seconds;
}
