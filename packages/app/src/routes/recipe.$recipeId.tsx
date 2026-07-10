import {createFileRoute} from "@tanstack/react-router";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Loading from "@/screen/loading";
import RecipeOverview from "@/screen/recipe-overview";
import BatchList from "@/screen/batch-list";
import {useBatches} from "@/state/batches";
import useIndexBy from "@/hooks/useIndexBy";

import {useRecipe} from "@/state/recipes";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const batches = useBatches(batch => batch.recipeId === recipeId);
    const recipe = useRecipe(recipeId);
    const recipesIndex = useIndexBy(recipe);

    const [active, setActive] = usePanelSwitcher("Overview");

    if (!recipe || !batches || !recipesIndex) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Overview">
                <RecipeOverview recipe={recipe} batchesCount={batches.length} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Batches">
                <BatchList batches={batches} recipesIndex={recipesIndex} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Editor">
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
