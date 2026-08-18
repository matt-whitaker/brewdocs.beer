import clock, {ClockControl} from "@/clock";
import {pendingWrites, Signal} from "@/signals";

declare global {
    interface Window {
        __e2e?: {clock: ClockControl; pendingWrites: Signal<number>};
    }
}

if (import.meta.env.VITE_E2E) {
    window.__e2e = {clock: clock.control, pendingWrites};
}
