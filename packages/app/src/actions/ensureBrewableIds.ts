import Brewable from "@/model/brewable";
import {newId} from "@/utils/id";

/**
 * Mints a stable per-instance `id` on every assignment, phase, and
 * phase-equipment item in a **batch** brewable that doesn't already have
 * one. Idempotent — an existing id is never regenerated, so ids survive
 * save → reload and Planning edits. Recipe/kb brewables never call this and
 * stay id-less (see CLAUDE.md's Model boundary).
 */
export default function ensureBrewableIds(brewable: Brewable): Brewable {
    brewable.assignments.forEach(assignment => {
        assignment.id ??= newId();
    });
    brewable.schedule.phases.forEach(phase => {
        phase.id ??= newId();
        phase.equipment.forEach(item => {
            item.id ??= newId();
        });
    });
    return brewable;
}
