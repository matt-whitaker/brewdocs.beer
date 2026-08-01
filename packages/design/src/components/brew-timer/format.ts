const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export function formatElapsed(totalSeconds: number) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const parts = [
        Math.floor(safeSeconds / SECONDS_PER_HOUR),
        Math.floor((safeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
        safeSeconds % SECONDS_PER_MINUTE
    ];
    return parts.map(part => String(part).padStart(2, "0")).join(":");
}
