"use client";

import Screen from "../../component/screen";
import Organics from "@/component/organics";
import Vitals from "@/component/vitals";
import {ScreenH1, ScreenH3, ScreenH4, ScreenP} from "@/component/typography";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";

export default function BatchSummary({ batch, recipe }: { batch: Batch; recipe: Recipe }) {
    return (
        <Screen>
            <ScreenH1>Brew Summary</ScreenH1>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold pt-2">
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH3>{recipe.name}<br />{batch.name || ""}</ScreenH3>
                    <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                    {batch.brewer ? (<ScreenH4>Brewed By {batch.brewer}</ScreenH4>) : <></>}
                    <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
                </div>
                <div className="divider">Measurements</div>
                <Vitals className="-mt-2" vitals={[["Target", recipe.targets], ["Actuals", batch.actuals]]} />
                <div className="divider">Organics</div>
                <Organics
                    className="-mt-2"
                    hops={batch.hops ?? recipe.hops}
                    grain={batch.grains ?? recipe.grains}
                    yeast={batch.yeast ?? recipe.yeast} />
            </div>
        </Screen>
    )
}