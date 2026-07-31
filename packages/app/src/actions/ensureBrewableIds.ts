import Brewable from "@/model/brewable";
import {newId} from "@/utils/id";

/**
 * Mints a stable per-instance `id` on every assignment and phase-equipment item
 * in a **batch** brewable that doesn't already have one. Idempotent — an
 * existing id is never regenerated, so ids survive save → reload and Planning
 * edits. Recipe/kb brewables never call this and stay id-less for these two
 * (see CLAUDE.md's Model boundary).
 *
 * ⚠️ Phases and milestones are **not** handled here: their ids are required and
 * minted at creation everywhere (`defaultBrewable`, `kbBrewableToBrewable`, the
 * add-rows), because assignments reference a phase *instance* by id — a phase
 * without one couldn't be referenced in the first place.
 */
export default function ensureBrewableIds(brewable: Brewable): Brewable {
    brewable.assignments.forEach(assignment => {
        assignment.id ??= newId();
    });
    brewable.schedule.phases.forEach(phase => {
        phase.equipment.forEach(item => {
            item.id ??= newId();
        });
    });
    return brewable;
}
