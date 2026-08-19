import {useMemo} from "react";
import {InputSelectOption} from "@brewdocs.beer/design";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Brewable, {phaseLabel, ResourceType} from "@/model/brewable";
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

export default function BrewableEditIngredients({ brewable, update, updateScalar, add, remove }: BrewableEditIngredientsProps) {
    const kbGrains = useKbGrains();
    const kbGrainsIndex = useIndexBy(kbGrains, "name");
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    const resourceOptions = useMemo<Record<ResourceType, InputSelectOption[]>>(() => ({
        grain: kbGrains.map(({ name }) => ({ value: name, name })),
        hop: kbHops.map(({ name }) => ({ value: name, name })),
        yeast: kbYeasts.map(({ name }) => ({ value: name, name })),
        additive: [],
    }), [kbGrains, kbHops, kbYeasts]);

    const assignmentsByPhase = useMemo(() => {
        const withIndex: AssignmentWithIndex[] = brewable.assignments.map((assignment, index) => ({ assignment, index }));
        return new Map(brewable.schedule.phases.map(phase => [
            phase.id,
            withIndex.filter(({ assignment }) => assignment.phaseId === phase.id),
        ]));
    }, [brewable.assignments, brewable.schedule.phases]);

    return (
        <>
            {brewable.schedule.phases.map((phase, i) => (
                <RecipeEditPhaseSection
                    key={phase.id}
                    label={phaseLabel(brewable.schedule.phases, i)}
                    phaseId={phase.id}
                    phaseType={phase.type}
                    assignments={assignmentsByPhase.get(phase.id) ?? []}
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
