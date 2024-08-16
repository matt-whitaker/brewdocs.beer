"use client";

import SrmAvatar from "@/component/srm-avatar";
import ScreenContainer from "@/component/screen-container";
import {useService} from "@/service/useService";
import getRecipes from "@/service/getRecipes";
import Organics from "@/component/organics";
import {ScreenH2, ScreenH3, ScreenH4, ScreenHr} from "../../component/typography";

export type RecipeOverviewProps = { i: number }

const getData = (i: number) => {
    const [recipes] = useService(getRecipes, []);
    return recipes[i] ?? null;
}

export default function RecipeOverview({ i }: RecipeOverviewProps) {
    const recipe = getData(i);

    if (!recipe) {
        return <></>;
    }
    return (
        <ScreenContainer>
            <ScreenH2 className="sm:block hidden">Recipe Overview</ScreenH2>
            <div className="flex">
                <div className="flex-grow">
                    <ScreenH3>{recipe.name}</ScreenH3>
                    <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                    <p className="text-sm">{recipe.description}</p>
                    <div className="flex pt-3 w-full justify-evenly [&>p]:grow [&>p]:text-left">
                        <p>ABV {recipe.targets.abv}</p>
                        <p>IBU {recipe.targets.ibu}</p>
                    </div>
                </div>
                <div className="ml-5 flex justify-center">
                    <SrmAvatar srm={recipe.targets.srm} />
                </div>
            </div>
            <ScreenHr className="sm:hidden" />
            <Organics className="sm:hidden" hops={recipe.hops} grain={recipe.grain} yeast={recipe.yeast} />
        </ScreenContainer>

    );
}