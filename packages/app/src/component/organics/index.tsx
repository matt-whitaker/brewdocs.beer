import classNames from "classnames";
import {ScreenH4} from "@brewdocs.beer/design";

// accepts either real batch-instance ingredients or raw kb-recipe-embedded
// ones (Hop[]/Grain[]/Yeast[] vs a KbRecipe's own hops/grains/yeasts shape) —
// this component only ever displays the name, so it doesn't need the full type
export type OrganicsProps = { hops: {name: string}[]; grain: {name: string}[]; yeast: {name: string}[]; className?: string }

export default function Organics({ hops, grain, yeast, className }: OrganicsProps) {
    return(
        <div className={classNames([className])}>
            <ScreenH4>Hops</ScreenH4>
            <p>{[...new Set(hops.map(({ name }) => name)).values()].join(", ")}</p>
            <ScreenH4>Grain</ScreenH4>
            <p>{grain.map(({ name }) => name).join(", ")}</p>
            <ScreenH4>Yeast</ScreenH4>
            <p>{yeast.map(({ name }) => name).join(", ")}</p>
        </div>
    )
}