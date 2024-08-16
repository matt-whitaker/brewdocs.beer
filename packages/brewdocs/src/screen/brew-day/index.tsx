"use client";

import ScreenContainer from "@brewdocs/component/screen-container";
import getRecipes from "@brewdocs/service/getRecipes";
import {useService} from "@brewdocs/service/useService";
import {ScreenH3, ScreenH4, ScreenHr} from "../../component/typography";
import getBatches from "@brewdocs/service/getBatches";
import InputGrid from "@brewdocs/component/input-grid";

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
        <ScreenContainer>
            <ScreenH3>1. Mash</ScreenH3>

            <ScreenH4>Strike Calculation</ScreenH4>
            <InputGrid inputs={[
                ["Grain", ["70°"], false, false],
                ["Target", ["167°"], false, false],
                ["Strike", ["185°"], true, false]
            ]}/>

            <ScreenH4>Infusion Schedule</ScreenH4>
            <InputGrid inputs={recipe.mash.map((m, i) => [`${i+1}.`, [`${m.temp}°`, `${m.time}min`]])}/>

            <ScreenH3>2. Boil</ScreenH3>
            <InputGrid inputs={recipe.hops.map((h, i) => [`${h.name}`, [`${h.weight}oz`, `${h.alpha}%`, `${h.boil}min`]])} />

            <ScreenH3>3. Yeast</ScreenH3>
            <InputGrid inputs={recipe.yeast.map((y, i) => [`${y.name}`, [`${y.temp}°`]])} />

            {/*<ScreenHr />*/}
            {/*<ScreenH3>Dry Hope</ScreenH3>*/}
            {/*<InputGrid inputs={recipe.hops.map((h, i) => [`${h.name}`, [`${h.weight}oz`, `${h.alpha}%`, `${h.boil}min`]])} />*/}

            <ScreenHr />
            <ScreenH3>Gravity Readings</ScreenH3>
            <InputGrid inputs={[
                ["Pre-Boil", [`${batch?.hydro?.pre ?? "0"}`], false, false],
                ["Post-Boil", [`${batch?.hydro?.boil ?? "0"}`], false, false],
                ["Racked", [`${batch?.hydro?.racked ?? "0"}`], false, false],
                ["Final", [`${batch?.hydro?.final ?? "0"}`], false, false]
            ]} />
        </ScreenContainer>
    )
}