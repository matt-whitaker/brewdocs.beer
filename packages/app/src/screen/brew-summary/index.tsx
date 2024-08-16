"use client";

import ScreenContainer from "@/component/screen-container";
import {useService} from "@/service/useService";
import getRecipes from "@/service/getRecipes";
import getBatches from "@/service/getBatches";
import Organics from "@/component/organics";
import Vitals from "@/component/vitals";
import {ScreenH2, ScreenH3, ScreenH4, ScreenHr, ScreenP} from "../../component/typography";

export type BrewSummaryProps = { i: number }

const getData = (i: number) => {
    const [recipes] = useService(getRecipes, []);
    const [batches] = useService(getBatches, []);
    return [recipes[i] ?? null, batches[i] ?? null];
}

export default function BrewSummary({ i }: BrewSummaryProps) {
    const [recipe, batch] = getData(i);

    if (!recipe || !batch) {
        return <></>;
    }

    return (
        <ScreenContainer>
            <ScreenH2 className="sm:block hidden">Brew Summary</ScreenH2>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold">
                <div className="sm:hidden">
                    <ScreenH3>{recipe.name}</ScreenH3>
                    <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                    <ScreenP><b>Brewed on</b> {batch.brewDate.toDateString()}</ScreenP>
                    <ScreenP>{`${recipe.description}`}</ScreenP>
                </div>
                <Vitals className="ml-4" vitals={[["Target", recipe.targets], ["Actuals", batch.actuals]]} />
                <ScreenHr className="mx-4"/>
                <Organics className="ml-4" hops={batch.hops} grain={batch.grain} yeast={batch.yeast} />
            </div>
        </ScreenContainer>
    )
}
