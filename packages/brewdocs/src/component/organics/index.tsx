import Hop from "@brewdocs/model/hop";
import Grain from "@brewdocs/model/grain";
import Yeast from "@brewdocs/model/yeast";
import classNames from "classnames";
import {ScreenH4} from "@brewdocs/component/typography";

export type OrganicsProps = { hops: Hop[]; grain: Grain[]; yeast: Yeast[]; className?: string }

export default function Organics({ hops, grain, yeast, className }: OrganicsProps) {
    return(
        <div className={classNames([className])}>
            <ScreenH4>Hops</ScreenH4>
            <p>{hops.map(({ name }) => name).join(", ")}</p>
            <ScreenH4>Grain</ScreenH4>
            <p>{grain.map(({ name }) => name).join(", ")}</p>
            <ScreenH4>Yeast</ScreenH4>
            <p>{yeast.map(({ name }) => name).join(", ")}</p>
        </div>
    )
}