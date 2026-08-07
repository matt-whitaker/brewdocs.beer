import {useEffect, useState} from "react";
import {elapsedSeconds, isRunning} from "@/model/timer";
import {TimerEvent} from "@/model/timer";

export default function useElapsedSeconds(events?: TimerEvent[]): number {
    const [seconds, setSeconds] = useState(() => elapsedSeconds(events, new Date()));
    const running = isRunning(events);

    useEffect(() => {
        const sync = () => setSeconds(elapsedSeconds(events, new Date()));

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
    }, [events, running]);

    return seconds;
}
