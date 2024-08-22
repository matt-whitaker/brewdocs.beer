"use client";

import Screen from "../../component/screen";
import useService from "@/service/useService";
import Organics from "@/component/organics";
import Vitals from "@/component/vitals";
import {ScreenH2, ScreenH3, ScreenH4, ScreenP} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import batchService from "@/service/batch";

export default function Summary() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<Batch|null>(batchService.get, null, [batchId]);
    const recipe= batch?.recipe;

    if (!batch) return <Error>'batch' missing</Error>
    if (!recipe) return <Error>'recipe' missing</Error>

    return (
        <Screen>
            <ScreenH2>Brew Summary</ScreenH2>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold">
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH3>{recipe.name}<br />{batch.name || ""}</ScreenH3>
                    <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                    {batch.brewer ? (<ScreenH4>Brewed By {batch.brewer}</ScreenH4>) : <></>}
                    <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
                </div>
                <div className="">Measurements</div>
                <Vitals className="ml-4 -mt-2" vitals={[["Target", recipe.targets], ["Actuals", batch.actuals]]} />
                <div className="">Organics</div>
                <Organics
                    className="ml-4 -mt-2"
                    hops={batch.hops ?? recipe.hops}
                    grain={batch.grains ?? recipe.grains}
                    yeast={batch.yeast ?? recipe.yeast} />
            </div>
        </Screen>
    )
}
