"use client";

import Screen from "../../component/screen";
import {useService} from "@/service/useService";
import Organics from "@/component/organics";
import Vitals from "@/component/vitals";
import {ScreenH2, ScreenH3, ScreenH4, ScreenP} from "@/component/typography";
import SrmAvatar from "@/component/srm-avatar";
import getBatch from "@/service/getBatch";
import Batch from "@/model/batch";
import Error from "@/component/error";
import useParam from "@/screen/useParam";
import {useSearchParams} from "next/navigation";

export default function Summary() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<typeof getBatch, Batch>(getBatch, [batchId]);
    if (!batch) return <Error>'batch' missing</Error>

    const recipe= batch?.recipe;
    if (!recipe) return <Error>'recipe' missing</Error>

    return (
        <Screen>
            <ScreenH2>Brew Summary</ScreenH2>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold">
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH3>{recipe.name}<br />{batch.name || ""}</ScreenH3>
                    <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                    {batch.brewer ? (<ScreenH4>Brewed By {batch.brewer}</ScreenH4>) : <></>}
                    <ScreenP>{`${recipe.description}`}</ScreenP>
                </div>
                <div className="divider clear-both">Measurements</div>
                <Vitals className="ml-4" vitals={[["Target", recipe.targets], ["Actuals", batch.actuals]]} />
                <div className="divider">Organics</div>
                <Organics
                    className="ml-4"
                    hops={batch.hops ?? recipe.hops}
                    grain={batch.grain ?? recipe.grain}
                    yeast={batch.yeast ?? recipe.yeast} />
            </div>
        </Screen>
    )
}
