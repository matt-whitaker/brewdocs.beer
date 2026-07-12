import classNames from "classnames";
import {ScreenH4} from "@brewdocs.beer/design";
import {useMemo} from "react";

// accepts either real batch-instance ingredients or raw kb-recipe-embedded
// ones (Hop[]/Grain[]/Yeast[] vs a KbRecipe's own hops/grains/yeasts shape) —
// this component only ever displays the name, so it doesn't need the full type
export type OrganicsProps = {
    hops: {name: string}[];
    grains: {name: string}[];
    yeasts: {name: string}[];
    className?: string
}

export default function Organics({ hops, grains, yeasts, className }: OrganicsProps) {
    const hopsList = useMemo(() => [...new Set(hops.map(({ name }) => name)).values()].join(", "), [hops]);
    const grainsList = useMemo(() => grains.map(({ name }) => name).join(", "), [grains]);
    const yeastsList = useMemo(() => yeasts.map(({ name }) => name).join(", "), [yeasts])
    return(
        <div className={classNames([className])}>
            <ScreenH4>Hops</ScreenH4>
            <p>{hopsList}</p>
            <ScreenH4>Grain</ScreenH4>
            <p>{grainsList}</p>
            <ScreenH4>Yeast</ScreenH4>
            <p>{yeastsList}</p>
        </div>
    )
}