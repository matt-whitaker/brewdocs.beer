import {useCallback, useState} from "react";
import {InputSelectOption, InputText} from "@brewdocs.beer/design";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType, ResourceType} from "@/model/brewable";
import {
    defaultAdditive,
    kbGrainToRecipeGrain,
    kbHopToRecipeHop,
    kbYeastToRecipeYeast,
    RESOURCE_TYPE_LABELS,
    RESOURCE_TYPE_SINGULAR_LABELS,
} from "@/screen/brewable-edit/ingredients/catalog-defaults";

export type RecipeEditResourceAddRowProps = {
    phaseId: string;
    /** the phase's display label, used for the accessible names of this row's controls */
    phaseLabel: string;
    /** whether a new "Additive" entry gets a boil time alongside its weight — Conditioning additives don't */
    phaseType: PhaseType;
    resourceType: ResourceType;
    add: AddFn;
    options: InputSelectOption[];
    kbGrainsIndex: Map<string, KbGrain>;
    kbHopsIndex: Map<string, KbHop>;
    kbYeastsIndex: Map<string, KbYeast>;
};

/** each case builds a single discriminated-union member so `resource` stays typed with no cast */
function buildCatalogAssignment(
    phaseId: string,
    resourceType: ResourceType,
    name: string,
    kbGrainsIndex: Map<string, KbGrain>,
    kbHopsIndex: Map<string, KbHop>,
    kbYeastsIndex: Map<string, KbYeast>
): Assignment | undefined {
    switch (resourceType) {
        case "grain": {
            const kbGrain = kbGrainsIndex.get(name);
            return kbGrain && { phaseId, resourceType, slug: kbGrain.name, resource: kbGrainToRecipeGrain(kbGrain) };
        }
        case "hop": {
            const kbHop = kbHopsIndex.get(name);
            return kbHop && { phaseId, resourceType, slug: kbHop.name, resource: kbHopToRecipeHop(kbHop) };
        }
        case "yeast": {
            const kbYeast = kbYeastsIndex.get(name);
            return kbYeast && { phaseId, resourceType, slug: kbYeast.name, resource: kbYeastToRecipeYeast(kbYeast) };
        }
        case "additive":
            return undefined;
    }
}

export default function RecipeEditResourceAddRow({
    phaseId, phaseLabel, phaseType, resourceType, add, options, kbGrainsIndex, kbHopsIndex, kbYeastsIndex,
}: RecipeEditResourceAddRowProps) {
    const [value, setValue] = useState<string | null>(null);
    const [additiveName, setAdditiveName] = useState("");

    const isAdditive = resourceType === "additive";

    const addAssignment = useCallback(() => {
        if (isAdditive) {
            const name = additiveName.trim();
            if (!name) return;
            add("assignments", { phaseId, resourceType: "additive", slug: name, resource: defaultAdditive(name, phaseType) });
            setAdditiveName("");
            return;
        }
        if (!value) return;
        const assignment = buildCatalogAssignment(phaseId, resourceType, value, kbGrainsIndex, kbHopsIndex, kbYeastsIndex);
        if (!assignment) return;
        add("assignments", assignment);
        setValue(null);
    }, [add, phaseId, phaseType, resourceType, value, isAdditive, additiveName, kbGrainsIndex, kbHopsIndex, kbYeastsIndex]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton label={`Add ${RESOURCE_TYPE_SINGULAR_LABELS[resourceType]} to ${phaseLabel}`} onClick={addAssignment} />
            <DataGridLabel className="ml-6">
                {isAdditive ? (
                    <InputText
                        className="w-full"
                        primary
                        label={`Additive for ${phaseLabel}`}
                        value={additiveName}
                        onChange={setAdditiveName}
                        placeholder="Additive name"
                    />
                ) : (
                    <DataGridSelect
                        label={`${RESOURCE_TYPE_LABELS[resourceType]} for ${phaseLabel}`}
                        allowNull
                        data={options}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </DataGridLabel>
        </DataGridRow>
    );
}
