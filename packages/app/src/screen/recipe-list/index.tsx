"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {useService} from "@/service/useService";
import {ScreenH2} from "@/component/typography";
import getRecipes from "@/service/getRecipes";
import Error from "@/component/error";

export default function RecipeList() {
    const recipes = useService<typeof getRecipes>(getRecipes, []);
    if (!recipes) { return <Error>'recipes' missing</Error> }

    return (
        <Screen>
            <ScreenH2 className="mt-0">Your brews</ScreenH2>
            <ul className="mt-4">
                {recipes.map((recipe, i) => (
                    <li key={recipe.id} className="list-disc ml-5 underline hover:font-semibold">
                        <Link href={`/batch/${i}`}>{recipe.name} by {recipe.brewer}</Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}