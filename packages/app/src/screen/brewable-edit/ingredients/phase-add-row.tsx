import {useCallback, useMemo, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType} from "@/model/brewable";
import {defaultAdditive, kbGrainToRecipeGrain, kbHopToRecipeHop, kbYeastToRecipeYeast} from "@/screen/brewable-edit/ingredients/catalog-defaults";

/** dropdown value for the freeform-additive choice — no colon, so it never collides with a `"<type>:<name>"` catalog value */
const ADDITIVE_VALUE = "additive";
const ADDITIVE_OPTION = { value: ADDITIVE_VALUE, name: "Additive…" };

/**
 * The per-phase ingredient add-row: a single "resource" dropdown, since the
 * phase is fixed by the section this row sits in and the resource *type* is
 * carried in the option value (`"<type>:<name>"`) rather than picked. Grains,
 * hops and yeasts come from the kb catalog; picking "Additive…" instead reveals
 * a text field, since additives are freeform (no catalog).
 */
export type RecipeEditPhaseAddRowProps = {
    phaseId: string;
    /** the phase's display label, used for the add button's accessible name */
    phaseLabel: string;
    /** which additive shape a new "Additive…" entry defaults to — weight for Conditioning, boil everywhere else */
    phaseType: PhaseType;
    add: AddFn;
    /** merged grain/hop/yeast options, each value encoded as `"<resourceType>:<name>"` */
    resourceOptions: { value: string; name: string }[];
    kbGrainsIndex: Map<string, KbGrain>;
    kbHopsIndex: Map<string, KbHop>;
    kbYeastsIndex: Map<string, KbYeast>;
};

/** decodes a `"<resourceType>:<name>"` catalog value into a full Assignment; each case builds a single discriminated-union member so `resource` stays typed with no cast */
function buildCatalogAssignment(
    phaseId: string,
    encoded: string,
    kbGrainsIndex: Map<string, KbGrain>,
    kbHopsIndex: Map<string, KbHop>,
    kbYeastsIndex: Map<string, KbYeast>
): Assignment | undefined {
    const sep = encoded.indexOf(":");
    const resourceType = encoded.slice(0, sep);
    const name = encoded.slice(sep + 1);
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
        default:
            return undefined;
    }
}

export default function RecipeEditPhaseAddRow({ phaseId, phaseLabel, phaseType, add, resourceOptions, kbGrainsIndex, kbHopsIndex, kbYeastsIndex }: RecipeEditPhaseAddRowProps) {
    const [value, setValue] = useState<string | null>(null);
    const [additiveName, setAdditiveName] = useState("");

    const options = useMemo(() => [...resourceOptions, ADDITIVE_OPTION], [resourceOptions]);
    const isAdditive = value === ADDITIVE_VALUE;

    const addAssignment = useCallback(() => {
        if (isAdditive) {
            const name = additiveName.trim();
            if (!name) return;
            add("assignments", { phaseId, resourceType: "additive", slug: name, resource: defaultAdditive(name, phaseType === "conditioning" ? "weight" : "boil") });
        } else {
            if (!value) return;
            const assignment = buildCatalogAssignment(phaseId, value, kbGrainsIndex, kbHopsIndex, kbYeastsIndex);
            if (!assignment) return;
            add("assignments", assignment);
        }
        setValue(null);
        setAdditiveName("");
    }, [add, phaseId, phaseType, value, isAdditive, additiveName, kbGrainsIndex, kbHopsIndex, kbYeastsIndex]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton label={`Add ingredient to ${phaseLabel}`} onClick={addAssignment} />
            <DataGridLabel className="ml-6" cols={isAdditive ? 2 : 4}>
                <DataGridSelect
                    label={`Ingredient for ${phaseLabel}`}
                    allowNull
                    data={options}
                    value={value}
                    onChange={setValue}
                />
            </DataGridLabel>
            {isAdditive && (
                <InputText
                    className="col-start-3 col-span-3"
                    primary
                    value={additiveName}
                    onChange={setAdditiveName}
                    placeholder="Additive name"
                />
            )}
        </DataGridRow>
    );
}
