import {useCallback, useState} from "react";
import {KbGrain, KbHop, KbYeast} from "@brewdocs.beer/kb";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {Assignment, PhaseType} from "@/model/brewable";
import {kbGrainToRecipeGrain, kbHopToRecipeHop, kbYeastToRecipeYeast} from "@/screen/recipe-edit-ingredients/catalog-defaults";

/**
 * The per-phase ingredient add-row: a single "resource" dropdown, since the
 * phase is fixed by the section this row sits in and the resource *type* is
 * carried in the option value (`"<type>:<name>"`) rather than picked. Additives
 * have no kb catalog, so they aren't offered here — only grains/hops/yeasts.
 */
export type RecipeEditPhaseAddRowProps = {
    phaseType: PhaseType;
    add: AddFn;
    /** merged grain/hop/yeast options, each value encoded as `"<resourceType>:<name>"` */
    resourceOptions: { value: string; name: string }[];
    kbGrainsIndex: Map<string, KbGrain>;
    kbHopsIndex: Map<string, KbHop>;
    kbYeastsIndex: Map<string, KbYeast>;
};

/** decodes a `"<resourceType>:<name>"` option value into a full Assignment; each case builds a single discriminated-union member so `resource` stays typed with no cast */
function buildAssignment(
    phaseType: PhaseType,
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
            return kbGrain && { phaseType, resourceType, slug: kbGrain.name, resource: kbGrainToRecipeGrain(kbGrain) };
        }
        case "hop": {
            const kbHop = kbHopsIndex.get(name);
            return kbHop && { phaseType, resourceType, slug: kbHop.name, resource: kbHopToRecipeHop(kbHop) };
        }
        case "yeast": {
            const kbYeast = kbYeastsIndex.get(name);
            return kbYeast && { phaseType, resourceType, slug: kbYeast.name, resource: kbYeastToRecipeYeast(kbYeast) };
        }
        default:
            return undefined;
    }
}

export default function RecipeEditPhaseAddRow({ phaseType, add, resourceOptions, kbGrainsIndex, kbHopsIndex, kbYeastsIndex }: RecipeEditPhaseAddRowProps) {
    const [value, setValue] = useState<string | null>(null);

    const addAssignment = useCallback(() => {
        if (!value) return;
        const assignment = buildAssignment(phaseType, value, kbGrainsIndex, kbHopsIndex, kbYeastsIndex);
        if (!assignment) return;
        add("brewable.assignments", assignment);
        setValue(null);
    }, [add, phaseType, value, kbGrainsIndex, kbHopsIndex, kbYeastsIndex]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton onClick={addAssignment} />
            <DataGridLabel className="ml-6" cols={4}>
                <DataGridSelect
                    allowNull
                    data={resourceOptions}
                    value={value}
                    onChange={setValue}
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
