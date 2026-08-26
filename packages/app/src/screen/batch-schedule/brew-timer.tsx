import {useCallback, useMemo, useState} from "react";
import {BrewTimer, BrewTimerMarker, BrewTimerScope, Hop, QuickActionTab, QuickActionTabState, ScreenP} from "@brewdocs.beer/design";
import {putEntry} from "@/actions/tracker";
import Modal from "@/component/modal";
import ModalScreen from "@/component/modal/screen";
import useModal from "@/component/modal/useModal";
import useElapsedSeconds from "@/hooks/useElapsedSeconds";
import {MutateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {currentPhaseIndex, phaseStartDate} from "@/model/batchProgress";
import {Assignment, assignmentResourceName, BrewablePhase, Milestone, phaseLabel, ResourceType} from "@/model/brewable";
import {incompleteAssignments, incompleteEquipment} from "@/model/scheduleProgress";
import {isRunning, runningSecondsSince, TimerEventType} from "@/model/timer";
import {key, ResourceActuals, ResourceScalarField, TrackerEntry} from "@/model/tracker";
import {useClock} from "@/providers/clock";
import {READING_KINDS, readingKindsForPhase, WATER_PARAMETERS} from "@/screen/batch-schedule/reading-kinds";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const TICK_MS = 1000;

const readingKind = (kind: string) => READING_KINDS.find(candidate => candidate.kind === kind);

const assignmentLabel = (assignment: Assignment) => {
    const planned: ResourceActuals = assignment.resource;
    return planned.boil
        ? `${assignmentResourceName(assignment)} · ${planned.boil.value}`
        : assignmentResourceName(assignment);
};

type MarkerOffset = (recorded?: string) => number | null;

const QUICK_SCHEDULE_KINDS: Record<ResourceType, { label: string; field: ResourceScalarField; valueLabel?: string }> = {
    grain: { label: "Grain", field: "weight", valueLabel: "Weight" },
    hop: { label: "Hop", field: "weight", valueLabel: "Weight" },
    additive: { label: "Additive", field: "weight", valueLabel: "Weight" },
    yeast: { label: "Yeast", field: "temp" }
};

export type BatchScheduleBrewTimerProps = {
    batch: Batch;
    mutate: MutateFn<Batch>;
    completePhase: (phaseId: string) => void;
};

export default function BatchScheduleBrewTimer({ batch, mutate, completePhase }: BatchScheduleBrewTimerProps) {
    const {now} = useClock();
    const phases = batch.brewable.schedule.phases;
    const [scope, setScope] = useState<BrewTimerScope>("global");
    const [completeModalRef, toggleCompleteModal] = useModal();

    const onPlayPause = useCallback(() => {
        mutate(draft => {
            const events = draft.timer ?? [];
            const type: TimerEventType = isRunning(events) ? "pause" : events.length ? "resume" : "start";
            return { ...draft, timer: [...events, { type, date: now().toISOString() }] };
        }, true);
    }, [mutate]);

    const onQuickMilestone = useCallback((kind: string, value: string, parameter?: string, label?: string) => {
        const spec = readingKind(kind);
        if (!spec) return;

        mutate(draft => {
            const index = currentPhaseIndex(draft.brewable.schedule.phases, draft.tracker);
            const phase = draft.brewable.schedule.phases[index];
            if (!phase) return draft;

            const milestone: Milestone = { id: newId(), label: label?.trim() || spec.defaultLabel, kind: spec.kind };
            const nextPhases = draft.brewable.schedule.phases.map((candidate, i) =>
                i === index ? { ...candidate, milestones: [...candidate.milestones, milestone] } : candidate);

            const recorded = now().toISOString();
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

    const onQuickSchedule = useCallback((id: string, value?: string) => {
        if (!id) return;
        mutate(draft => {
            const assignment = draft.brewable.assignments.find(candidate => candidate.id === id);
            if (!assignment) return draft;

            const {field} = QUICK_SCHEDULE_KINDS[assignment.resourceType];
            const typed = value?.trim();
            const planned: ResourceActuals = assignment.resource;
            const unit = planned[field]?.unit;
            const entry: TrackerEntry = {completed: true, date: now().toISOString()};

            if (typed && unit) entry.resource = {[field]: scalarFromNumberWithUnit(typed, unit)};

            return {...draft, tracker: putEntry(draft.tracker, {on: "assignment", id}, entry)};
        }, true);
    }, [mutate]);

    const onQuickEquipment = useCallback((id: string) => {
        if (!id) return;
        mutate(draft => ({
            ...draft,
            tracker: putEntry(draft.tracker, {on: "equipment", id}, {completed: true, date: now().toISOString()})
        }), true);
    }, [mutate]);

    const currentIndex = useMemo(() => currentPhaseIndex(phases, batch.tracker), [phases, batch.tracker]);
    const currentPhaseLabel = phases[currentIndex] ? phaseLabel(phases, currentIndex) : "";
    const currentPhaseId = phases[currentIndex]?.id;

    const phaseBoundary = useMemo(
        () => phaseStartDate(phases, currentIndex, batch.tracker, batch.timer),
        [phases, currentIndex, batch.tracker, batch.timer]);

    const globalElapsed = useElapsedSeconds(batch.timer);
    const phaseElapsed = useElapsedSeconds(batch.timer, phaseBoundary);
    const elapsed = scope === "phase" ? phaseElapsed : globalElapsed;

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

    const milestoneValuePlaceholders = useMemo(
        () => Object.fromEntries(READING_KINDS
            .flatMap(({ kind, valuePlaceholder }) => valuePlaceholder ? [[kind, valuePlaceholder] as const] : [])),
        []);

    const remaining = useMemo(
        () => incompleteAssignments(batch.brewable, currentPhaseId, batch.tracker),
        [batch.brewable, currentPhaseId, batch.tracker]);

    const scheduleOptions = useMemo(
        () => remaining.map(assignment => ({ name: assignmentLabel(assignment), value: assignment.id ?? "" })),
        [remaining]);

    const scheduleValueLabels = useMemo(
        () => Object.fromEntries(remaining
            .map(assignment => [assignment.id ?? "", QUICK_SCHEDULE_KINDS[assignment.resourceType].valueLabel])
            .filter(([, label]) => !!label)),
        [remaining]);

    const scheduleValueDefaults = useMemo(
        () => Object.fromEntries(remaining
            .map(assignment => {
                const planned: ResourceActuals = assignment.resource;
                return [assignment.id ?? "", planned[QUICK_SCHEDULE_KINDS[assignment.resourceType].field]?.value];
            })
            .filter(([, value]) => !!value)),
        [remaining]);

    const equipmentOptions = useMemo(
        () => incompleteEquipment(batch.brewable, currentPhaseId, batch.tracker)
            .map(({ id, name }) => ({ name, value: id ?? "" })),
        [batch.brewable, currentPhaseId, batch.tracker]);

    const quickActionTabs = useMemo<Record<QuickActionTab, QuickActionTabState>>(() => ({
        ingredients: {
            available: scheduleOptions.length > 0,
            unavailableReason: "Nothing left to add on this phase"
        },
        reading: {
            available: milestoneKindOptions.length > 0,
            unavailableReason: "No readings apply to this phase"
        },
        equipment: {
            available: equipmentOptions.length > 0,
            unavailableReason: "Nothing left to check off on this phase"
        }
    }), [scheduleOptions, milestoneKindOptions, equipmentOptions]);

    const sessionStart = batch.timer?.find(({ type }) => type === "start")?.date;

    const markers = useMemo<BrewTimerMarker[]>(() => {
        const markersOf = (phase: BrewablePhase, index: number, at: MarkerOffset): BrewTimerMarker[] => {
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

            const hopMarkers = batch.brewable.assignments.flatMap(assignment => {
                if (assignment.phaseId !== phase.id || assignment.resourceType !== "hop" || !assignment.id) return [];

                const entry = batch.tracker[key({ on: "assignment", id: assignment.id })];
                if (!entry?.completed) return [];

                const offsetSeconds = at(entry.date);
                if (offsetSeconds === null) return [];

                return [{
                    id: `assignment:${assignment.id}`,
                    offsetSeconds,
                    label: assignmentLabel(assignment),
                    kind: "Hop",
                    icon: Hop
                }];
            });

            const itemMarkers = [...milestoneMarkers, ...hopMarkers];
            const completedAt = at(batch.tracker[key({ on: "phase", id: phase.id })]?.date);
            if (completedAt === null) return itemMarkers;

            return [...itemMarkers, {
                id: `phase:${phase.id}`,
                offsetSeconds: completedAt,
                label: phaseLabel(phases, index),
                kind: "Phase complete"
            }];
        };

        const stampsOf = (phase: BrewablePhase, index: number, at: MarkerOffset): BrewTimerMarker[] => {
            const stamps: BrewTimerMarker[] = [];
            const startOffset = at(phaseStartDate(phases, index, batch.tracker, batch.timer)?.toISOString());
            const completeOffset = at(batch.tracker[key({ on: "phase", id: phase.id })]?.date);

            if (startOffset !== null) {
                stamps.push({
                    id: `phase-start:${phase.id}`,
                    offsetSeconds: startOffset,
                    label: phaseLabel(phases, index),
                    kind: "Phase start"
                });
            }

            if (completeOffset !== null) {
                stamps.push({
                    id: `phase:${phase.id}`,
                    offsetSeconds: completeOffset,
                    label: phaseLabel(phases, index),
                    kind: "Phase complete"
                });
            }

            return stamps;
        };

        if (scope === "phase") {
            const phase = phases[currentIndex];
            if (!phase || !phaseBoundary) return [];

            const runningAt: MarkerOffset = recorded => {
                const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
                if (Number.isNaN(recordedAt) || recordedAt < phaseBoundary.getTime()) return null;

                const eventsThrough = batch.timer?.filter(({ date }) => new Date(date).getTime() <= recordedAt);
                return runningSecondsSince(eventsThrough, phaseBoundary, new Date(recordedAt));
            };

            return markersOf(phase, currentIndex, runningAt);
        }

        const startedAt = sessionStart ? new Date(sessionStart).getTime() : NaN;
        if (Number.isNaN(startedAt)) return [];

        const at: MarkerOffset = recorded => {
            const recordedAt = recorded ? new Date(recorded).getTime() : NaN;
            return Number.isNaN(recordedAt) ? null : Math.floor((recordedAt - startedAt) / 1000);
        };

        return phases.slice(0, currentIndex + 1).flatMap((phase, index) => stampsOf(phase, index, at));
    }, [scope, sessionStart, phaseBoundary, currentIndex, phases, batch.brewable.assignments, batch.timer, batch.tracker]);

    return (
        <>
            <BrewTimer
                className="mb-2"
                isRunning={isRunning(batch.timer)}
                elapsedSeconds={elapsed}
                scope={scope}
                markers={markers}
                markerTransitionMs={TICK_MS}
                quickActionTabs={quickActionTabs}
                defaultQuickActionTab="reading"
                milestoneKindOptions={milestoneKindOptions}
                milestoneParameterOptions={milestoneParameterOptions}
                milestoneValuePlaceholders={milestoneValuePlaceholders}
                scheduleOptions={scheduleOptions}
                scheduleValueLabels={scheduleValueLabels}
                scheduleValueDefaults={scheduleValueDefaults}
                equipmentOptions={equipmentOptions}
                phaseLabel={currentPhaseLabel}
                completeLabel={currentPhaseLabel}
                onPlayPause={onPlayPause}
                onScopeChange={setScope}
                onQuickMilestone={onQuickMilestone}
                onQuickSchedule={onQuickSchedule}
                onQuickEquipment={onQuickEquipment}
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
