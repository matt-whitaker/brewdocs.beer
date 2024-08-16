"use client";

import Link from "next/link";
import ScreenContainer from "@/component/screen-container";
import getRecipes from "@/service/getRecipes";
import {useService} from "@/service/useService";
import {ScreenH2} from "@/component/typography";

export default function BrewList() {
    const [recipes] = useService(getRecipes, []);

    if (!recipes.length) {
        return <></>;
    }

    return (
        <ScreenContainer>
            <ScreenH2>Your brews</ScreenH2>
            <ul className="mt-4">
                {recipes.map((recipe, i) => (
                    <li key={recipe.id} className="list-disc ml-5 underline hover:font-semibold">
                        <Link href={`/recipe/${i}`}>{recipe.name} by {recipe.brewer || ""}</Link>
                    </li>
                ))}
            </ul>
        </ScreenContainer>
    )
}