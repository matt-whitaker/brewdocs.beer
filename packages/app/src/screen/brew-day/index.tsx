"use client";

import Screen from "../../component/screen";
import getRecipes from "@/service/getRecipes";
import {useService} from "@/service/useService";
import {ScreenH3, ScreenH4 } from "@/component/typography";
import getBatches from "@/service/getBatches";
import InputGrid, {TitleCell} from "@/component/input-grid";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Cell from "@/component/input-grid/cell";
import Row from "@/component/input-grid/row";

export type BrewDayProps = { i: number }

const getData = (i: number) => {
    const [recipes] = useService(getRecipes, []);
    const [batches] = useService(getBatches, []);
    return [recipes[i] ?? null, batches[i] ?? null];
}

export default function BrewDay({ i }: BrewDayProps) {
    const [recipe, batch] = getData(i);

    if (!recipe) {
        return <></>;
    }

    return (
        <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
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
                <InputGrid<Mash> rows={recipe.mash} attrs={["temp", "time"]} titleAttr={"name"} titleEditable />

                <ScreenH3>2. Boil</ScreenH3>
                <InputGrid<Hop> rows={recipe.hops} attrs={["weight", "alpha", "boil"]} titleAttr={"name"} titleEditable />
            </div>
            <div>
                <ScreenH3>3. Yeast</ScreenH3>
                <InputGrid<Yeast> rows={recipe.yeast} attrs={["temp"]} titleAttr={"name"} titleEditable />

                <ScreenH3>Gravity Readings</ScreenH3>
                <InputGrid<{ name: string; gravity: string }>
                    rows={[
                        { name: "Pre-Boil", gravity: batch?.hydro?.pre.gravity ?? "0.0" },
                        { name: "Post-Boil", gravity: batch?.hydro?.post.gravity ?? "0.0" },
                        { name: "Racked", gravity: batch?.hydro?.racked.gravity ?? "0.0" },
                        { name: "Final", gravity: batch?.hydro?.final.gravity ?? "0.0" }
                    ]}
                    attrs={["gravity"]}
                    titleAttr="name"
                    titleEditable={false} />
            </div>
        </Screen>
    )
}