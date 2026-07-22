import {createFileRoute} from "@tanstack/react-router";
import {ScreenH1, ScreenH2, ScreenP} from "@brewdocs.beer/design";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import RecipeEditIngredients from "@/screen/recipe-edit-ingredients";
import RecipeEditSchedule from "@/screen/recipe-edit-schedule";
import {useRecipe} from "@/state/recipes";

export const Route = createFileRoute("/recipe/$recipeId_/edit")({
    component: RecipeEditPage
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();
    const recipe = useRecipe(recipeId);

    return (
        <Screen>
            <ScreenH1 className="mb-2">Edit Recipe</ScreenH1>
            <div className="pb-4 relative">
                <ScreenH2 className="first-of-type:mt-0">{recipe.name}</ScreenH2>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
            </div>
            <PanelSwitcher compact name="recipe.edit" defaultTab="Details">
                <PanelSwitcherContent title="Details">
                    <RecipeEditDetails recipeId={recipeId} />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Ingredients">
                    <RecipeEditIngredients recipeId={recipeId} />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Schedule">
                    <RecipeEditSchedule recipeId={recipeId} />
                </PanelSwitcherContent>
            </PanelSwitcher>
        </Screen>
    );
}
