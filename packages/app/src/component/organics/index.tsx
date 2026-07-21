import {Fragment, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridHeaderRow from "@/component/data-grid/header-row";

// accepts either real batch-instance ingredients or raw kb-recipe-embedded
// ones (Hop[]/Grain[]/Yeast[] vs a KbRecipe's own hops/grains/yeasts shape) —
// this component only ever displays the name, so it doesn't need the full type
export type OrganicsProps = {
    hops: {name: string}[];
    grains: {name: string}[];
    yeasts: {name: string}[];
    className?: string
};

export default function Organics({ hops, grains, yeasts, className }: OrganicsProps) {
    // hops repeat across boil additions, so collapse them to distinct names
    const hopsList = useMemo(() => [...new Set(hops.map(({ name }) => name)).values()].join(", "), [hops]);
    const grainsList = useMemo(() => grains.map(({ name }) => name).join(", "), [grains]);
    const yeastsList = useMemo(() => yeasts.map(({ name }) => name).join(", "), [yeasts]);

    const rows = useMemo<[string, string][]>(
        () => [["Hops", hopsList], ["Grain", grainsList], ["Yeast", yeastsList]],
        [hopsList, grainsList, yeastsList]
    );

    return (
        <DataGrid className={className}>
            {rows.map(([name, list]) => (
                <Fragment key={name}>
                    {/* labels — three collapsible headers in one grid would fold each
                        other's rows, since the collapse rule takes every following
                        sibling */}
                    <DataGridHeaderRow>{name}</DataGridHeaderRow>
                    <DataGridRow zebra>
                        {/* no label in the row, so the list gets the full width to wrap into */}
                        <div className="col-span-6 self-center text-sm">{list}</div>
                    </DataGridRow>
                </Fragment>
            ))}
        </DataGrid>
    );
}
