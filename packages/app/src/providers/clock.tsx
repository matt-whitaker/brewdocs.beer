import {createContext, ReactNode, useContext} from "react";
import defaultClock, {Clock} from "@/clock";

const ClockContext = createContext<Clock | null>(null);

export function ClockProvider({clock = defaultClock, children}: {clock?: Clock; children: ReactNode}) {
    return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>;
}

export function useClock(): Clock {
    const clock = useContext(ClockContext);
    if (!clock) throw new Error("useClock requires a ClockProvider");
    return clock;
}
