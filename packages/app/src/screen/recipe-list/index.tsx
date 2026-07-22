import {useNavigate} from "@tanstack/react-router";
import {useCallback, useMemo} from "react";
import {ScreenH1} from "@brewdocs.beer/design";
import createRecipe from "@/actions/createRecipe";
import Screen from "@/component/screen";
import {Plus} from "@/component/svg";
import RecipeListItem from "@/screen/recipe-list/item";
import {useKbRecipes} from "@/state/kbRecipes";

export default function RecipeList() {
    const recipes = useKbRecipes();
    const navigate = useNavigate();

    const recipeListItems = useMemo(() => recipes.map((recipe, i) => (
        <RecipeListItem key={i} recipe={recipe} />
    )), [recipes]);

    const onCreate = useCallback(() =>
        createRecipe().then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate]);

    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <button className="btn btn-primary btn-sm mt-2" onClick={onCreate}>
                <Plus className="w-4 -ml-1" /> Create Recipe
            </button>
            <ul className="w-full menu px-0">
                {recipeListItems}
            </ul>
        </Screen>
    );
}