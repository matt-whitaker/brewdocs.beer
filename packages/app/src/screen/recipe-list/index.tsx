import {useMemo} from "react";
import {ScreenH1} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import RecipeListItem from "@/screen/recipe-list/item";
import {useKbRecipes} from "@/state/kbRecipes";

export default function RecipeList() {
    const recipes = useKbRecipes();

    const recipeListItems = useMemo(() => recipes.map((recipe, i) => (
        <RecipeListItem key={i} recipe={recipe} />
    )), [recipes]);

    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <ul className="w-full menu px-0">
                {recipeListItems}
            </ul>
        </Screen>
    );
}