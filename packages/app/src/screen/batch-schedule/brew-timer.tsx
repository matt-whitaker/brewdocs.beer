import {useCallback, useMemo} from "react";
import {BrewTimer, BrewTimerMarker} from "@brewdocs.beer/design";
import {currentPhaseIndex} from "@/actions/batchProgress";
import {isRunning} from "@/actions/brewTimer";
import {putEntry} from "@/actions/tracker";
import useElapsedSeconds from "@/hooks/useElapsedSeconds";
import {MutateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {Milestone, phaseLabel} from "@/model/brewable";
import {TimerEventType} from "@/model/timer";
import {key, TrackerEntry} from "@/model/tracker";
import {READING_KINDS, readingKindsForPhase, WATER_PARAMETERS} from "@/screen/batch-schedule/reading-kinds";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const TICK_MS = 1000;

const readingKind = (kind: string) => READING_KINDS.find(candidate => candidate.kind === kind);

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

    const onQuickMilestone = useCallback((kind: string, value: string, parameter?: string) => {
        const spec = readingKind(kind);
        if (!spec) return;

        mutate(draft => {
            const index = currentPhaseIndex(draft.brewable.schedule.phases, draft.tracker);
            const phase = draft.brewable.schedule.phases[index];
            if (!phase) return draft;

            const milestone: Milestone = { id: newId(), label: spec.defaultLabel, kind: spec.kind };
            const nextPhases = draft.brewable.schedule.phases.map((candidate, i) =>
                i === index ? { ...candidate, milestones: [...candidate.milestones, milestone] } : candidate);

            const recorded = new Date().toISOString();
            const typed = value.trim();
            const unit = spec.unitOptions?.[0].value;
            const entry: TrackerEntry = { date: recorded };

            if (typed && spec.primary === "reading" && unit) {
                entry.reading = scalarFromNumberWithUnit(typed, unit);
            } else if (typed && spec.primary === "waterParameter" && parameter) {
                const param = WATER_PARAMETERS.find(({ key: name }) => name === parameter);
                if (param) entry.water = { [param.key]: scalarFromNumberWithUnit(typed, param.unit) };
            }

            return {
                ...draft,
                brewable: { ...draft.brewable, schedule: { ...draft.brewable.schedule, phases: nextPhases } },
                tracker: putEntry(draft.tracker, { on: "milestone", id: milestone.id }, entry)
            };
        }, true);
    }, [mutate]);

    const currentIndex = useMemo(() => currentPhaseIndex(phases, batch.tracker), [phases, batch.tracker]);
    const currentPhaseLabel = phases[currentIndex] ? phaseLabel(phases, currentIndex) : "";

    const milestoneKindOptions = useMemo(
        () => (phases[currentIndex] ? readingKindsForPhase(phases[currentIndex].type) : [])
            .map(({ kind, headerLabel }) => ({ name: headerLabel, value: kind })),
        [phases, currentIndex]);

    const milestoneParameterOptions = useMemo(
        () => ({ water: WATER_PARAMETERS.map(({ key: name, label }) => ({ name: label, value: name })) }),
        []);

    const sessionStart = batch.timer?.find(({ type }) => type === "start")?.date;

    const markers = useMemo<BrewTimerMarker[]>(() => {
        const startedAt = sessionStart ? new Date(sessionStart).getTime() : NaN;
        if (Number.isNaN(startedAt)) return [];

        const at = (recorded: string | undefined) => {
            const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
            return Number.isNaN(recordedAt) ? null : Math.floor((recordedAt - startedAt) / 1000);
        };

        return phases.flatMap((phase, index) => {
            const milestoneMarkers = phase.milestones.flatMap(milestone => {
                const offsetSeconds = at(batch.tracker[key({ on: "milestone", id: milestone.id })]?.date);
                if (offsetSeconds === null) return [];

                return [{
                    id: milestone.id,
                    offsetSeconds,
                    label: milestone.label,
                    kind: readingKind(milestone.kind)?.headerLabel ?? milestone.kind
                }];
            });

            const completedAt = at(batch.tracker[key({ on: "phase", id: phase.id })]?.date);
            if (completedAt === null) return milestoneMarkers;

            return [...milestoneMarkers, {
                id: `phase:${phase.id}`,
                offsetSeconds: completedAt,
                label: phaseLabel(phases, index),
                kind: "Phase complete"
            }];
        });
    }, [sessionStart, phases, batch.tracker]);

    return (
        <BrewTimer
            className="mb-2"
            isRunning={isRunning(batch.timer)}
            elapsedSeconds={elapsed}
            markers={markers}
            markerTransitionMs={TICK_MS}
            milestoneKindOptions={milestoneKindOptions}
            milestoneParameterOptions={milestoneParameterOptions}
            phaseLabel={currentPhaseLabel}
            onPlayPause={onPlayPause}
            onQuickMilestone={onQuickMilestone} />
    );
}
