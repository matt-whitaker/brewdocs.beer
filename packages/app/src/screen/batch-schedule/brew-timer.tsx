import {useCallback, useMemo} from "react";
import {BrewTimer, BrewTimerMarker} from "@brewdocs.beer/design";
import {isRunning} from "@/actions/brewTimer";
import {putEntry} from "@/actions/tracker";
import useElapsedSeconds from "@/hooks/useElapsedSeconds";
import {MutateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {Milestone, MilestoneKind, PhaseType, phaseLabel} from "@/model/brewable";
import {TimerEventType} from "@/model/timer";
import {key} from "@/model/tracker";
import {newId} from "@/utils/id";

const TICK_MS = 1000;

type QuickMilestoneKind = {
    kind: MilestoneKind;
    name: string;
    defaultLabel: string;
    phaseType?: PhaseType;
};

const QUICK_MILESTONE_KINDS: QuickMilestoneKind[] = [
    { kind: "gravity", name: "Gravity", defaultLabel: "Reading" },
    { kind: "volume", name: "Volume", defaultLabel: "Volume" },
    { kind: "temperature", name: "Temperature", defaultLabel: "Temperature" },
    { kind: "pressure", name: "Pressure", defaultLabel: "Pressure", phaseType: "carbonation" },
    { kind: "kegDate", name: "Keg date", defaultLabel: "Keg date", phaseType: "carbonation" },
    { kind: "bottleDate", name: "Bottle date", defaultLabel: "Bottle date", phaseType: "conditioning" }
];

const quickMilestoneKind = (kind: string) => QUICK_MILESTONE_KINDS.find(candidate => candidate.kind === kind);

export type BatchScheduleBrewTimerProps = {
    batch: Batch;
    mutate: MutateFn<Batch>;
};

export default function BatchScheduleBrewTimer({ batch, mutate }: BatchScheduleBrewTimerProps) {
    const elapsed = useElapsedSeconds(batch.timer);
    const phases = batch.brewable.schedule.phases;

    const onPlayPause = useCallback(() => {
        mutate(draft => {
            const events = draft.timer ?? [];
            const type: TimerEventType = isRunning(events) ? "pause" : events.length ? "resume" : "start";
            return { ...draft, timer: [...events, { type, date: new Date().toISOString() }] };
        }, true);
    }, [mutate]);

    const onQuickMilestone = useCallback((kind: string, phaseId: string) => {
        const spec = quickMilestoneKind(kind);
        if (!spec) return;

        mutate(draft => {
            const index = draft.brewable.schedule.phases.findIndex(phase => phase.id === phaseId);
            if (index < 0) return draft;

            const milestone: Milestone = { id: newId(), label: spec.defaultLabel, kind: spec.kind };
            const nextPhases = draft.brewable.schedule.phases.map((phase, i) =>
                i === index ? { ...phase, milestones: [...phase.milestones, milestone] } : phase);

            return {
                ...draft,
                brewable: { ...draft.brewable, schedule: { ...draft.brewable.schedule, phases: nextPhases } },
                tracker: putEntry(draft.tracker, { on: "milestone", id: milestone.id }, { date: new Date().toISOString() })
            };
        }, true);
    }, [mutate]);

    const milestoneKindOptions = useMemo(
        () => QUICK_MILESTONE_KINDS
            .filter(({ phaseType }) => !phaseType || phases.some(phase => phase.type === phaseType))
            .map(({ kind, name }) => ({ name, value: kind })),
        [phases]);

    const phaseOptions = useMemo(
        () => phases.map((phase, index) => ({ name: phaseLabel(phases, index), value: phase.id })),
        [phases]);

    const sessionStart = batch.timer?.find(({ type }) => type === "start")?.date;

    const markers = useMemo<BrewTimerMarker[]>(() => {
        const startedAt = sessionStart ? new Date(sessionStart).getTime() : NaN;
        if (Number.isNaN(startedAt)) return [];

        return phases.flatMap(phase => phase.milestones.flatMap(milestone => {
            const recorded = batch.tracker[key({ on: "milestone", id: milestone.id })]?.date;
            const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
            if (Number.isNaN(recordedAt)) return [];

            return [{
                id: milestone.id,
                offsetSeconds: Math.round((recordedAt - startedAt) / 1000),
                label: milestone.label,
                kind: quickMilestoneKind(milestone.kind)?.name ?? milestone.kind
            }];
        }));
    }, [sessionStart, phases, batch.tracker]);

    return (
        <BrewTimer
            className="mb-2"
            isRunning={isRunning(batch.timer)}
            elapsedSeconds={elapsed}
            markers={markers}
            markerTransitionMs={TICK_MS}
            milestoneKindOptions={milestoneKindOptions}
            phaseOptions={phaseOptions}
            onPlayPause={onPlayPause}
            onQuickMilestone={onQuickMilestone} />
    );
}
