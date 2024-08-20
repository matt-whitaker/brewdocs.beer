"use client";

import Screen from "../../component/screen";
import {ScreenH3, ScreenH4, ScreenH5} from "@/component/typography";
import InputGrid, {TitleCell} from "@/component/input-grid";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Cell from "@/component/input-grid/cell";
import Row from "@/component/input-grid/row";
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

                <ScreenH4>Strike Calculation</ScreenH4>
                <InputGrid<{ name: string; temp: string }>
                    titleAttr="name"
                    attrs={["temp"]}
                    titleEditable={false}
                    rows={[
                        { name: "Grain", temp: "70°"},
                        { name: "Target", temp: "167°" }
                    ]}>
                    <Row><TitleCell value="Strike" /><Cell readonly value="185°" col={3} /></Row>
                </InputGrid>

                <ScreenH4>Infusion Schedule</ScreenH4>
                <ScreenH5>1. Single Infusion</ScreenH5>
                <InputGrid<Grain> rows={recipe.grain} attrs={["weight"]} titleAttr={"name"} titleEditable />

                <ScreenH3>2. Boil</ScreenH3>
                <InputGrid<Hop> rows={recipe.hops} attrs={["weight", "alpha", "boil"]} titleAttr={"name"} titleEditable />
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <InputGrid<Yeast> rows={recipe.yeast} attrs={["temp"]} titleAttr={"name"} titleEditable />

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