import {useCallback, useMemo} from "react";
import {BrewTimer, BrewTimerMarker, BrewTimerScope, ScreenP} from "@brewdocs.beer/design";
import {currentPhaseIndex, phaseStartDate} from "@/actions/batchProgress";
import {isRunning, phaseElapsedSeconds} from "@/actions/brewTimer";
import {putEntry} from "@/actions/tracker";
import Modal from "@/component/modal";
import ModalScreen from "@/component/modal/screen";
import useModal from "@/component/modal/useModal";
import useElapsedSeconds, {usePhaseElapsedSeconds} from "@/hooks/useElapsedSeconds";
import {MutateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {Milestone, phaseLabel} from "@/model/brewable";
import {TimerEventType} from "@/model/timer";
import {key, TrackerEntry} from "@/model/tracker";
import {READING_KINDS, readingKindsForPhase, WATER_PARAMETERS} from "@/screen/batch-schedule/reading-kinds";
import {saveSession, useSession} from "@/state/session";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const TICK_MS = 1000;
const SCOPE_SESSION_KEY = "schedule.timerScope";

const readingKind = (kind: string) => READING_KINDS.find(candidate => candidate.kind === kind);

const milestoneMarker = (milestone: Milestone, offsetSeconds: number): BrewTimerMarker => ({
    id: milestone.id,
    offsetSeconds,
    label: milestone.label,
    kind: readingKind(milestone.kind)?.headerLabel ?? milestone.kind
});

export type BatchScheduleBrewTimerProps = {
    batch: Batch;
    mutate: MutateFn<Batch>;
    completePhase: (phaseId: string) => void;
};

export default function BatchScheduleBrewTimer({ batch, mutate, completePhase }: BatchScheduleBrewTimerProps) {
    const phases = batch.brewable.schedule.phases;
    const [completeModalRef, toggleCompleteModal] = useModal();

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

    const onConfirmComplete = useCallback(() => {
        const phase = phases[currentIndex];
        if (phase) completePhase(phase.id);
    }, [phases, currentIndex, completePhase]);

    const milestoneKindOptions = useMemo(
        () => (phases[currentIndex] ? readingKindsForPhase(phases[currentIndex].type) : [])
            .map(({ kind, headerLabel }) => ({ name: headerLabel, value: kind })),
        [phases, currentIndex]);

    const milestoneParameterOptions = useMemo(
        () => ({ water: WATER_PARAMETERS.map(({ key: name, label }) => ({ name: label, value: name })) }),
        []);

    const sessionStart = batch.timer?.find(({ type }) => type === "start")?.date;
    const phaseStart = phaseStartDate(phases, batch.tracker, currentIndex, sessionStart);

    const session = useSession();
    const scope: BrewTimerScope = session[SCOPE_SESSION_KEY] === "phase" ? "phase" : "global";
    const onScopeChange = useCallback((next: BrewTimerScope) => { saveSession(SCOPE_SESSION_KEY, next); }, []);

    const globalElapsed = useElapsedSeconds(batch.timer);
    const phaseElapsed = usePhaseElapsedSeconds(batch.timer, phaseStart);

    const globalMarkers = useMemo<BrewTimerMarker[]>(() => {
        const startedAt = sessionStart ? new Date(sessionStart).getTime() : NaN;
        if (Number.isNaN(startedAt)) return [];

        const at = (recorded: string | undefined) => {
            const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
            return Number.isNaN(recordedAt) ? null : Math.floor((recordedAt - startedAt) / 1000);
        };

        return phases.flatMap((phase, index) => {
            const milestoneMarkers = phase.milestones.flatMap(milestone => {
                const offsetSeconds = at(batch.tracker[key({ on: "milestone", id: milestone.id })]?.date);
                return offsetSeconds === null ? [] : [milestoneMarker(milestone, offsetSeconds)];
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

    const phaseMarkers = useMemo<BrewTimerMarker[]>(() => {
        const phase = phases[currentIndex];
        if (!phase || !phaseStart) return [];

        return phase.milestones.flatMap(milestone => {
            const recorded = batch.tracker[key({ on: "milestone", id: milestone.id })]?.date;
            const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
            if (Number.isNaN(recordedAt)) return [];

            return [milestoneMarker(milestone, phaseElapsedSeconds(batch.timer, phaseStart, new Date(recordedAt)))];
        });
    }, [phases, currentIndex, phaseStart, batch.timer, batch.tracker]);

    return (
        <>
            <BrewTimer
                className="mb-2"
                isRunning={isRunning(batch.timer)}
                elapsedSeconds={scope === "phase" ? phaseElapsed : globalElapsed}
                scope={scope}
                markers={scope === "phase" ? phaseMarkers : globalMarkers}
                markerTransitionMs={TICK_MS}
                milestoneKindOptions={milestoneKindOptions}
                milestoneParameterOptions={milestoneParameterOptions}
                phaseLabel={currentPhaseLabel}
                completeLabel={currentPhaseLabel}
                onPlayPause={onPlayPause}
                onScopeChange={onScopeChange}
                onQuickMilestone={onQuickMilestone}
                onComplete={toggleCompleteModal} />
            {currentPhaseLabel ? (
                <Modal ref={completeModalRef}>
                    <ModalScreen title={`Complete ${currentPhaseLabel}`} onConfirm={onConfirmComplete}>
                        <ScreenP>This can't be undone.</ScreenP>
                    </ModalScreen>
                </Modal>
            ) : null}
        </>
    );
}
