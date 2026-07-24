import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType} from "@/model/brewable";
import RecipeEditAssignmentRow from "@/screen/recipe-edit-ingredients/assignment-row";
import {PHASE_TYPE_LABELS, RESOURCE_TYPES, RESOURCE_TYPE_LABELS} from "@/screen/recipe-edit-ingredients/catalog-defaults";
import {saveSession, useSession} from "@/state/session";

/** an assignment paired with its index in the flat `brewable.assignments` array — the index a row's remove/update calls must target, since this component only ever sees its phase's filtered slice */
export type AssignmentWithIndex = { assignment: Assignment; index: number };

export type RecipeEditPhaseSectionProps = {
    phaseType: PhaseType;
    assignments: AssignmentWithIndex[];
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

export default function RecipeEditPhaseSection({ phaseType, assignments, remove, update, updateScalar }: RecipeEditPhaseSectionProps) {
    const sessionKey = `recipe-edit.brewable.phase.${phaseType}`;
    const session = useSession();
    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    // only subsections with at least one assignment render — the add-row (not
    // a per-subsection one) is what puts the first item into an empty combo
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
                {PHASE_TYPE_LABELS[phaseType]}
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
        </DataGrid>
    );
}
