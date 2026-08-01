import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {InputSelectOption} from "@/components/input-select";
import {useModal} from "@/components/modal";
import {Pause, Play, Plus} from "@/components/svg";
import {Timeline} from "@/components/timeline";
import {formatElapsed} from "./format";
import {BrewTimerMarker, BrewTimerMarkerOverlay} from "./marker-overlay";
import {QuickMilestoneModal} from "./quick-milestone";

export type {BrewTimerMarker} from "./marker-overlay";

export type BrewTimerProps = PropsWithClass & {
    isRunning: boolean;
    elapsedSeconds: number;
    markers?: BrewTimerMarker[];
    milestoneKindOptions: InputSelectOption[];
    phaseOptions: InputSelectOption[];
    height?: number;
    markerSize?: number;
    markerTransitionMs?: number;
    label?: string;
    onPlayPause: () => void;
    onQuickMilestone: (kind: string, phaseId: string) => void;
};

export function BrewTimer({
    isRunning,
    elapsedSeconds,
    markers = [],
    milestoneKindOptions,
    phaseOptions,
    height = 24,
    markerSize = 10,
    markerTransitionMs,
    label = "Brew day elapsed timeline",
    onPlayPause,
    onQuickMilestone,
    className
}: BrewTimerProps) {
    const [modalRef, toggleModal] = useModal();

    return (
        <div className={classNames("rounded-box border border-base-300 bg-base-100 p-3 flex flex-col gap-3", [className])}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-circle btn-primary btn-sm"
                        aria-label={isRunning ? "Pause timer" : "Start timer"}
                        aria-pressed={isRunning}
                        onClick={onPlayPause}>
                        {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <span role="timer" aria-label="Elapsed time" className="font-mono text-lg sm:text-2xl tabular-nums">
                        {formatElapsed(elapsedSeconds)}
                    </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:ml-auto sm:justify-end">
                    <div className="join" role="group" aria-label="Timer scope">
                        <button type="button" className="btn btn-xs join-item btn-active" aria-pressed={true}>Global</button>
                        <button type="button" className="btn btn-xs join-item" title="Coming soon" disabled>Phase</button>
                    </div>
                    <button type="button" className="btn btn-sm" aria-label="Log milestone" onClick={toggleModal}>
                        <Plus className="h-4 w-4" />
                        Milestone
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
            <QuickMilestoneModal
                ref={modalRef}
                kindOptions={milestoneKindOptions}
                phaseOptions={phaseOptions}
                onSubmit={onQuickMilestone} />
        </div>
    );
}
