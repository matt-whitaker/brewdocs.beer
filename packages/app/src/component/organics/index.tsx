import {Fragment, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridRow from "@/component/data-grid/row";

// accepts either real batch-instance ingredients or raw kb-recipe-embedded
// ones (Hop[]/Grain[]/Yeast[] vs a KbRecipe's own hops/grains/yeasts shape) —
// this component only ever displays the name, so it doesn't need the full type
export type OrganicsProps = {
    hops: {name: string}[];
    grains: {name: string}[];
    yeasts: {name: string}[];
    additives: {name: string}[];
    className?: string
};

const namesList = (items: {name: string}[]) => items.map(({ name }) => name).join(", ");
// hops and additives repeat across boil additions, so collapse them to distinct names
const distinctNamesList = (items: {name: string}[]) => [...new Set(items.map(({ name }) => name)).values()].join(", ");

export default function Organics({ hops, grains, yeasts, additives, className }: OrganicsProps) {
    const hopsList = useMemo(() => distinctNamesList(hops), [hops]);
    const grainsList = useMemo(() => namesList(grains), [grains]);
    const yeastsList = useMemo(() => namesList(yeasts), [yeasts]);
    const additivesList = useMemo(() => distinctNamesList(additives), [additives]);

    const rows = useMemo<[string, string][]>(
        () => [["Hops", hopsList], ["Grain", grainsList], ["Yeast", yeastsList], ["Additives", additivesList]],
        [hopsList, grainsList, yeastsList, additivesList]
    );

    return (
        <DataGrid className={className}>
            {rows.map(([name, list]) => (
                <Fragment key={name}>
                    {}
                    <DataGridHeaderRow>{name}</DataGridHeaderRow>
                    <DataGridRow zebra>
                        {}
                        <div className="col-span-6 self-center text-sm">{list}</div>
                    </DataGridRow>
                </Fragment>
            ))}
        </DataGrid>
    );
}
