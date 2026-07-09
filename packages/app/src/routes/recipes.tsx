import {createFileRoute} from "@tanstack/react-router";
import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {useRecipes} from "@/state/recipes";
import Loading from "@/screen/loading";

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
    const recipes = useRecipes();
    const [active, change] = usePanelSwitcher("All");

    if (!recipes) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="All">
                <RecipeList recipes={recipes} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    )
}
