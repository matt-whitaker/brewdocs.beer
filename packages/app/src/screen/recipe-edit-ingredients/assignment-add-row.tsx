import {useCallback, useMemo, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType, ResourceType} from "@/model/brewable";
import {
    defaultAdditive,
    kbGrainToRecipeGrain,
    kbHopToRecipeHop,
    kbYeastToRecipeYeast,
    PHASE_TYPE_OPTIONS,
    RESOURCE_TYPE_OPTIONS,
} from "@/screen/recipe-edit-ingredients/catalog-defaults";

export type RecipeEditAssignmentAddRowProps = {
    add: AddFn;
    kbGrains: KbGrain[];
    kbGrainsIndex: Map<string, KbGrain>;
    kbHops: KbHop[];
    kbHopsIndex: Map<string, KbHop>;
    kbYeasts: KbYeast[];
    kbYeastsIndex: Map<string, KbYeast>;
};

/** additive has no kb catalog, so `resourceName` is a typed name rather than a picked one — everything else resolves against the matching kb index */
function buildAssignment(
    phaseType: PhaseType,
    resourceType: ResourceType,
    resourceName: string,
    kbGrainsIndex: Map<string, KbGrain>,
    kbHopsIndex: Map<string, KbHop>,
    kbYeastsIndex: Map<string, KbYeast>
): Assignment | undefined {
    switch (resourceType) {
        case "grain": {
            const kbGrain = kbGrainsIndex.get(resourceName);
            return kbGrain && { phaseType, resourceType, slug: kbGrain.name, resource: kbGrainToRecipeGrain(kbGrain) };
        }
        case "hop": {
            const kbHop = kbHopsIndex.get(resourceName);
            return kbHop && { phaseType, resourceType, slug: kbHop.name, resource: kbHopToRecipeHop(kbHop) };
        }
        case "yeast": {
            const kbYeast = kbYeastsIndex.get(resourceName);
            return kbYeast && { phaseType, resourceType, slug: kbYeast.name, resource: kbYeastToRecipeYeast(kbYeast) };
        }
        case "additive": {
            const trimmed = resourceName.trim();
            return trimmed ? { phaseType, resourceType, slug: trimmed, resource: defaultAdditive(trimmed) } : undefined;
        }
    }
}

export default function RecipeEditAssignmentAddRow({
    add, kbGrains, kbGrainsIndex, kbHops, kbHopsIndex, kbYeasts, kbYeastsIndex,
}: RecipeEditAssignmentAddRowProps) {
    const [phaseType, setPhaseType] = useState<PhaseType | null>(null);
    const [resourceType, setResourceType] = useState<ResourceType | null>(null);
    const [resourceName, setResourceName] = useState<string | null>(null);

    const onChangePhaseType = useCallback((value: string) => setPhaseType(value as PhaseType), []);

    // a new resource type invalidates whatever resource was picked for the previous one
    const onChangeResourceType = useCallback((value: string) => {
        setResourceType(value as ResourceType);
        setResourceName(null);
    }, []);

    const resourceOptions = useMemo(() => {
        switch (resourceType) {
            case "grain": return kbGrains.map(({ name }) => ({ value: name, name }));
            case "hop": return kbHops.map(({ name }) => ({ value: name, name }));
            case "yeast": return kbYeasts.map(({ name }) => ({ value: name, name }));
            default: return [];
        }
    }, [resourceType, kbGrains, kbHops, kbYeasts]);

    const addAssignment = useCallback(() => {
        if (!phaseType || !resourceType || !resourceName) return;

        const assignment = buildAssignment(phaseType, resourceType, resourceName, kbGrainsIndex, kbHopsIndex, kbYeastsIndex);
        if (!assignment) return;

        add("brewable.assignments", assignment);
        setPhaseType(null);
        setResourceType(null);
        setResourceName(null);
    }, [add, phaseType, resourceType, resourceName, kbGrainsIndex, kbHopsIndex, kbYeastsIndex]);

    return (
        <DataGridRow zebra>
            <DataGridAddButton onClick={addAssignment} />
            <DataGridSelect
                cols={2}
                className="ml-6"
                allowNull
                data={PHASE_TYPE_OPTIONS}
                value={phaseType}
                onChange={onChangePhaseType}
            />
            <DataGridSelect
                cols={2}
                className="col-start-3"
                allowNull
                data={RESOURCE_TYPE_OPTIONS}
                value={resourceType}
                onChange={onChangeResourceType}
            />
            {resourceType === "additive" ? (
                <InputText
                    className="col-start-5 col-span-2"
                    value={resourceName ?? ""}
                    onChange={setResourceName}
                    placeholder="New additive name"
                />
            ) : (
                <DataGridSelect
                    cols={2}
                    className="col-start-5"
                    allowNull
                    data={resourceOptions}
                    value={resourceName}
                    onChange={setResourceName}
                />
            )}
        </DataGridRow>
    );
}
