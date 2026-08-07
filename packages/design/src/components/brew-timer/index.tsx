import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {InputSelectOption} from "@/components/input-select";
import {useModal} from "@/components/modal";
import {Pause, Play, Plus} from "@/components/svg";
import {Timeline} from "@/components/timeline";
import {formatElapsed} from "./format";
import {BrewTimerMarker, BrewTimerMarkerOverlay} from "./marker-overlay";
import {QuickActionModal} from "./quick-action";

export type {BrewTimerMarker} from "./marker-overlay";
export type {QuickActionTab} from "./quick-action";

export type BrewTimerProps = PropsWithClass & {
    isRunning: boolean;
    elapsedSeconds: number;
    markers?: BrewTimerMarker[];
    milestoneKindOptions: InputSelectOption[];
    milestoneParameterOptions?: Record<string, InputSelectOption[]>;
    scheduleKindOptions?: InputSelectOption[];
    scheduleValueLabels?: Record<string, string>;
    phaseLabel: string;
    height?: number;
    markerSize?: number;
    markerTransitionMs?: number;
    label?: string;
    completeLabel?: string;
    onPlayPause: () => void;
    onQuickMilestone: (kind: string, value: string, parameter?: string) => void;
    onQuickSchedule?: (kind: string, value?: string) => void;
    onQuickEquipment?: () => void;
    onComplete?: () => void;
};

export function BrewTimer({
    isRunning,
    elapsedSeconds,
    markers = [],
    milestoneKindOptions,
    milestoneParameterOptions,
    scheduleKindOptions,
    scheduleValueLabels,
    phaseLabel,
    height = 24,
    markerSize = 10,
    markerTransitionMs,
    label = "Brew day elapsed timeline",
    completeLabel,
    onPlayPause,
    onQuickMilestone,
    onQuickSchedule,
    onQuickEquipment,
    onComplete,
    className
}: BrewTimerProps) {
    const [modalRef, toggleModal] = useModal();

    return (
        <div className={classNames("rounded-box border border-base-300 bg-base-100 p-2 sm:p-3 flex flex-col gap-2 sm:gap-3", [className])}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
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
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:ml-auto sm:justify-end sm:gap-3">
                    <div className="join" role="group" aria-label="Timer scope">
                        <button type="button" className="btn btn-xs sm:btn-sm join-item btn-active" aria-pressed={true}>Global</button>
                        <button type="button" className="btn btn-xs sm:btn-sm join-item" title="Coming soon" disabled>Phase</button>
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
            {completeLabel && onComplete
                ? (
                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            className="btn btn-primary btn-xs sm:btn-sm"
                            aria-label={`Complete ${completeLabel}`}
                            onClick={onComplete}>
                            Complete {completeLabel}
                        </button>
                    </div>
                )
                : null}
            <QuickActionModal
                ref={modalRef}
                milestoneKindOptions={milestoneKindOptions}
                milestoneParameterOptions={milestoneParameterOptions}
                scheduleKindOptions={scheduleKindOptions}
                scheduleValueLabels={scheduleValueLabels}
                phaseLabel={phaseLabel}
                onQuickMilestone={onQuickMilestone}
                onQuickSchedule={onQuickSchedule}
                onQuickEquipment={onQuickEquipment} />
        </div>
    );
}
