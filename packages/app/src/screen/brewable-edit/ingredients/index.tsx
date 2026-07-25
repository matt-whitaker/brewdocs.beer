import {useMemo} from "react";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Brewable, {PhaseType} from "@/model/brewable";
import RecipeEditPhaseSection, {AssignmentWithIndex} from "@/screen/brewable-edit/ingredients/phase-section";
import {useKbGrains} from "@/state/kbGrains";
import {useKbHops} from "@/state/kbHops";
import {useKbYeasts} from "@/state/kbYeasts";

export type BrewableEditIngredientsProps = {
    brewable: Brewable;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    add: AddFn;
    remove: RemoveFn;
};

// A brewable panel: reads the assignments/phases off the brewable and edits
// them through the shared edit fns (dot-paths are relative to the brewable).
export default function BrewableEditIngredients({ brewable, update, updateScalar, add, remove }: BrewableEditIngredientsProps) {
    const kbGrains = useKbGrains();
    const kbGrainsIndex = useIndexBy(kbGrains, "name");
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    // a phase's add-row offers every catalog resource in one dropdown; the value
    // carries the resource type (`"<type>:<name>"`) so the row can build the
    // right assignment without a second dropdown. Additives have no catalog and
    // aren't offered here.
    const resourceOptions = useMemo(() => [
        ...kbGrains.map(({ name }) => ({ value: `grain:${name}`, name })),
        ...kbHops.map(({ name }) => ({ value: `hop:${name}`, name })),
        ...kbYeasts.map(({ name }) => ({ value: `yeast:${name}`, name })),
    ], [kbGrains, kbHops, kbYeasts]);

    // the grouping order — distinct phase types, in the order they first
    // appear in the schedule (an assignment only carries a `phaseType`, not a
    // specific phase instance, so repeated phases of one type collapse together)
    const phaseTypes = useMemo(() => {
        const seen = new Set<PhaseType>();
        const ordered: PhaseType[] = [];
        for (const phase of brewable.schedule.phases) {
            if (!seen.has(phase.type)) {
                seen.add(phase.type);
                ordered.push(phase.type);
            }
        }
        return ordered;
    }, [brewable.schedule.phases]);

    const assignmentsByPhase = useMemo(() => {
        const withIndex: AssignmentWithIndex[] = brewable.assignments.map((assignment, index) => ({ assignment, index }));
        return new Map(phaseTypes.map(phaseType => [
            phaseType,
            withIndex.filter(({ assignment }) => assignment.phaseType === phaseType),
        ]));
    }, [brewable.assignments, phaseTypes]);

    return (
        <>
            {phaseTypes.map((phaseType, i) => (
                <RecipeEditPhaseSection
                    key={phaseType}
                    position={i + 1}
                    phaseType={phaseType}
                    assignments={assignmentsByPhase.get(phaseType) ?? []}
                    add={add}
                    remove={remove}
                    update={update}
                    updateScalar={updateScalar}
                    resourceOptions={resourceOptions}
                    kbGrainsIndex={kbGrainsIndex}
                    kbHopsIndex={kbHopsIndex}
                    kbYeastsIndex={kbYeastsIndex}
                />
            ))}
        </>
    );
}
