"use client";

import Screen from "../../component/screen";
import {ScreenH3, ScreenH5} from "@/component/typography";
import InputGrid from "@/component/input-grid";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import getBatch from "@/service/getBatch";
import {useService} from "@/service/useService";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import Grain from "@/model/grain";
import Hydrometer from "@/model/hydrometer";

export default function BrewDay() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<typeof getBatch, Batch>(getBatch, [batchId]);
    if (!batch) return <Error>'batch' missing</Error>

    const recipe = batch?.recipe;
    if (!recipe) return <Error>'recipe' missing</Error>

    return (
        <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 box-border">
            <div>
                <ScreenH3>1. Mash</ScreenH3>
                {batch.mash.map((m, i) => [
                    <ScreenH5>{i+1}. {m.name}  - {m.time}</ScreenH5>,
                    <InputGrid<Grain> rows={batch.grains} attrs={["weight"]} titleAttr={"name"} titleEditable />
                ])}

                <ScreenH3>2. Boil</ScreenH3>
                {batch.boil.map((m, i) => [
                    <ScreenH5>{i+1}. {m.name}  - {m.time}</ScreenH5>,
                    <InputGrid<Hop> rows={batch.hops} attrs={["weight", "alpha", "boil"]} titleAttr={"name"} titleEditable />
                ])}
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <InputGrid<Yeast> rows={batch.yeast} attrs={["temp"]} titleAttr={"name"} titleEditable />

                <ScreenH3>Gravity Readings</ScreenH3>
                <InputGrid<Hydrometer>
                    rows={batch.hydrometer}
                    attrs={["gravity"]}
                    titleAttr="date"
                    titleEditable={false} />
            </div>
        </Screen>
    )
}