import Hop from "@/model/hop";
import Grain from "@/model/grain";
import Yeast from "@/model/yeast";
import classNames from "classnames";
import {ScreenH4} from "@/component/typography";

export type OrganicsProps = { hops: Hop[]; grain: Grain[]; yeast: Yeast[]; className?: string }

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