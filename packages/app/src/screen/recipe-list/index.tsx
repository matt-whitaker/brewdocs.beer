import {useMemo, useState} from "react";
import {CardGrid} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb/src";
import ErrorBoundary from "@/component/error-boundary";
import Screen from "@/component/screen";
import SearchBar from "@/component/search-bar";
import Recipe from "@/model/recipe";
import RecipeListItem, {RecipeListItemFallback} from "@/screen/recipe-list/item";
import {useKbRecipes} from "@/state/kbRecipes";
import {useRecipes} from "@/state/recipes";
import {FilterFn} from "@/utils/func";


export type RecipeListProps = {
    source: "all"|"user"|"kb"
    filterFn?: FilterFn<Recipe | KbRecipe>
};

export default function RecipeList({ source = "all",  filterFn }: RecipeListProps) {
    const recipes = useRecipes();
    const kbRecipes = useKbRecipes();
    const [query, setQuery] = useState("");

    const shownRecipes = useMemo(() => {
        const kb = kbRecipes.map((recipe) => ({ recipe, source: "kb" as const }));
        const user = recipes.map((recipe) => ({ recipe, source: "user" as const }));
        const all = {
            "all": [...kb, ...user],
            "user": user,
            "kb": kb
        }[source].filter(({ recipe }) => !!recipe);
        const bySource = filterFn ? all.filter(({ recipe }) => filterFn(recipe)) : all;

        const q = query.trim().toLowerCase();
        return q ? bySource.filter(({ recipe }) => recipe.name.toLowerCase().includes(q)) : bySource;
    }, [recipes, kbRecipes, source, filterFn, query]);

    const recipeListItems = useMemo(() => shownRecipes.map(({ recipe, source: recipeSource }) => (
        <ErrorBoundary key={`${recipeSource}:${recipe.id}`} fallback={<RecipeListItemFallback />}>
            <RecipeListItem
                recipe={recipe}
                source={recipeSource}
            />
        </ErrorBoundary>
    )), [shownRecipes]);

    return (
        <Screen>
            <SearchBar value={query} onChange={setQuery} label="Search recipes" />
            <CardGrid className="mt-2">
                {recipeListItems}
            </CardGrid>
        </Screen>
    );
}