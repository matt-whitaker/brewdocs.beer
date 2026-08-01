export type TimerEventType = "start" | "pause" | "resume" | "stop";

export interface TimerEvent {
    type: TimerEventType;
    date: string;
}
