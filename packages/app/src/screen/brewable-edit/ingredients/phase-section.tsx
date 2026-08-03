import classNames from "classnames";
import {useCallback, useMemo} from "react";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType} from "@/model/brewable";
import RecipeEditAssignmentRow from "@/screen/brewable-edit/ingredients/assignment-row";
import {RESOURCE_TYPES, RESOURCE_TYPE_LABELS} from "@/screen/brewable-edit/ingredients/catalog-defaults";
import RecipeEditPhaseAddRow from "@/screen/brewable-edit/ingredients/phase-add-row";
import {saveSession, useSession} from "@/state/session";

/** an assignment paired with its index in the flat `brewable.assignments` array — the index a row's remove/update calls must target, since this component only ever sees its phase's filtered slice */
export type AssignmentWithIndex = { assignment: Assignment; index: number };

export type RecipeEditPhaseSectionProps = {
    /** the phase's display label, e.g. "2. Boil" — matches the Phases panel */
    label: string;
    /** the BrewablePhase.id this section edits; new assignments point at it */
    phaseId: string;
    /** the phase's type, passed down to the add-row so a new additive defaults to the right shape */
    phaseType: PhaseType;
    assignments: AssignmentWithIndex[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    resourceOptions: { value: string; name: string }[];
    kbGrainsIndex: Map<string, KbGrain>;
    kbHopsIndex: Map<string, KbHop>;
    kbYeastsIndex: Map<string, KbYeast>;
};

export default function RecipeEditPhaseSection({
    label, phaseId, phaseType, assignments, add, remove, update, updateScalar, resourceOptions, kbGrainsIndex, kbHopsIndex, kbYeastsIndex,
}: RecipeEditPhaseSectionProps) {
    const sessionKey = `recipe-edit.brewable.phase.${phaseId}`;
    const session = useSession();
    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    // only subsections with at least one assignment render — the phase's own
    // add-row (below, inside the collapsible section) seeds the first item of
    // any type into this phase
    const subsections = useMemo(() => RESOURCE_TYPES
        .map(resourceType => ({
            resourceType,
            items: assignments.filter(({ assignment }) => assignment.resourceType === resourceType),
        }))
        .filter(({ items }) => items.length > 0), [assignments]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[sessionKey] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                {label}
            </DataGridHeaderRow>
            {subsections.map(({ resourceType, items }) => (
                <div key={resourceType}>
                    <DataGridSubheaderRow>{RESOURCE_TYPE_LABELS[resourceType]}</DataGridSubheaderRow>
                    {items.map(({ assignment, index }) => (
                        <RecipeEditAssignmentRow
                            key={`assignment-${index}`}
                            row={index}
                            assignment={assignment}
                            remove={remove}
                            update={update}
                            updateScalar={updateScalar}
                        />
                    ))}
                </div>
            ))}
            <div className={classNames({ "mt-2 border-t border-base-300": subsections.length > 0 })}>
                <DataGridSubheaderRow>Add to {label}</DataGridSubheaderRow>
                <RecipeEditPhaseAddRow
                    phaseId={phaseId}
                    phaseLabel={label}
                    phaseType={phaseType}
                    add={add}
                    resourceOptions={resourceOptions}
                    kbGrainsIndex={kbGrainsIndex}
                    kbHopsIndex={kbHopsIndex}
                    kbYeastsIndex={kbYeastsIndex}
                />
            </div>
        </DataGrid>
    );
}
