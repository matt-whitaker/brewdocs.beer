import {BrewablePhase} from "@/model/brewable";
import {key, TrackerEntry} from "@/model/tracker";

export function isPhaseComplete(tracker: Record<string, TrackerEntry>, phaseId: string): boolean {
    return !!tracker[key({on: "phase", id: phaseId})]?.completed;
}

/**
 * The index of the first phase not yet complete — the batch's live progress
 * pointer — or `phases.length` once every phase is done. Derived from the
 * brewable's own phase order plus the tracker, never stored.
 */
export function currentPhaseIndex(phases: BrewablePhase[], tracker: Record<string, TrackerEntry>): number {
    const index = phases.findIndex(phase => !isPhaseComplete(tracker, phase.id));
    return index === -1 ? phases.length : index;
}
