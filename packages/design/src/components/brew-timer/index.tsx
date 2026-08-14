import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {InputSelectOption} from "@/components/input-select";
import {useModal} from "@/components/modal";
import {Pause, Play, Plus} from "@/components/svg";
import {Timeline} from "@/components/timeline";
import {formatElapsed} from "./format";
import {BrewTimerMarker, BrewTimerMarkerOverlay} from "./marker-overlay";
import {QuickActionModal, QuickActionTab, QuickActionTabState} from "./quick-action";

export type {BrewTimerMarker} from "./marker-overlay";
export type {QuickActionTab, QuickActionTabState} from "./quick-action";

export type BrewTimerScope = "global" | "phase";

const SCOPE_OPTIONS: {value: BrewTimerScope; label: string}[] = [
    {value: "global", label: "Global"},
    {value: "phase", label: "Phase"}
];

export type BrewTimerProps = PropsWithClass & {
    isRunning: boolean;
    elapsedSeconds: number;
    scope: BrewTimerScope;
    markers?: BrewTimerMarker[];
    quickActionTabs: Record<QuickActionTab, QuickActionTabState>;
    defaultQuickActionTab: QuickActionTab;
    milestoneKindOptions: InputSelectOption[];
    milestoneParameterOptions?: Record<string, InputSelectOption[]>;
    milestoneValuePlaceholders?: Record<string, string>;
    scheduleOptions?: InputSelectOption[];
    scheduleValueLabels?: Record<string, string>;
    scheduleValueDefaults?: Record<string, string>;
    equipmentOptions?: InputSelectOption[];
    phaseLabel: string;
    height?: number;
    markerSize?: number;
    markerTransitionMs?: number;
    label?: string;
    completeLabel?: string;
    onPlayPause: () => void;
    onScopeChange: (scope: BrewTimerScope) => void;
    onQuickMilestone: (kind: string, value: string, parameter?: string, label?: string) => void;
    onQuickSchedule: (id: string, value?: string) => void;
    onQuickEquipment: (id: string) => void;
    onComplete?: () => void;
};

export function BrewTimer({
    isRunning,
    elapsedSeconds,
    scope,
    markers = [],
    quickActionTabs,
    defaultQuickActionTab,
    milestoneKindOptions,
    milestoneParameterOptions,
    milestoneValuePlaceholders,
    scheduleOptions,
    scheduleValueLabels,
    scheduleValueDefaults,
    equipmentOptions,
    phaseLabel,
    height = 24,
    markerSize = 10,
    markerTransitionMs,
    label = "Brew day elapsed timeline",
    completeLabel,
    onPlayPause,
    onScopeChange,
    onQuickMilestone,
    onQuickSchedule,
    onQuickEquipment,
    onComplete,
    className
}: BrewTimerProps) {
    const [modalRef, toggleModal] = useModal();

    return (
        <div className={classNames("rounded-box border border-base-300 bg-base-100 p-2 sm:p-3 flex flex-col gap-2 sm:gap-3", [className])}>
            <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        className="btn btn-circle btn-primary btn-xs sm:btn-sm"
                        aria-label={isRunning ? "Pause timer" : "Start timer"}
                        aria-pressed={isRunning}
                        onClick={onPlayPause}>
                        {isRunning
                            ? <Pause className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            : <Play className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
                    </button>
                    <span role="timer" aria-label="Elapsed time" className="font-mono text-lg sm:text-2xl tabular-nums">
                        {formatElapsed(elapsedSeconds)}
                    </span>
                    {completeLabel && onComplete
                        ? (
                            <button
                                type="button"
                                className="btn btn-primary btn-xs sm:btn-sm ml-auto"
                                aria-label={`Complete ${completeLabel}`}
                                onClick={onComplete}>
                                Complete {completeLabel}
                            </button>
                        )
                        : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="join" role="group" aria-label="Timer scope">
                        {SCOPE_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                className={classNames("btn btn-xs sm:btn-sm join-item", {"btn-active": scope === option.value})}
                                aria-pressed={scope === option.value}
                                onClick={() => onScopeChange(option.value)}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="btn btn-xs sm:btn-sm" aria-label="Quick actions" onClick={toggleModal}>
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        Log
                    </button>
                </div>
            </div>
            <div className="relative" style={{height}}>
                <Timeline
                    durationSeconds={elapsedSeconds}
                    markers={markers}
                    height={height}
                    markerSize={markerSize}
                    markerTransitionMs={markerTransitionMs}
                    label={label} />
                <BrewTimerMarkerOverlay
                    markers={markers}
                    elapsedSeconds={elapsedSeconds}
                    markerSize={markerSize} />
            </div>
            <QuickActionModal
                ref={modalRef}
                tabs={quickActionTabs}
                defaultTab={defaultQuickActionTab}
                milestoneKindOptions={milestoneKindOptions}
                milestoneParameterOptions={milestoneParameterOptions}
                milestoneValuePlaceholders={milestoneValuePlaceholders}
                scheduleOptions={scheduleOptions}
                scheduleValueLabels={scheduleValueLabels}
                scheduleValueDefaults={scheduleValueDefaults}
                equipmentOptions={equipmentOptions}
                phaseLabel={phaseLabel}
                onQuickMilestone={onQuickMilestone}
                onQuickSchedule={onQuickSchedule}
                onQuickEquipment={onQuickEquipment} />
        </div>
    );
}
