import {createFileRoute} from "@tanstack/react-router";
import {Plus} from "@brewdocs.beer/design";
import Action from "@/component/action";
import {Crumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeCreateModal from "@/screen/recipe-create-modal";
import RecipeList from "@/screen/recipe-list";

// module const so the array is stable across renders (see useBreadcrumbs)
const BREADCRUMBS: Crumb[] = [{ label: "Recipes" }];

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
    useBreadcrumbs(BREADCRUMBS);

    const createAction = <Action label="Create" icon={Plus} modalContent={<RecipeCreateModal />} />;

    return (
        <PanelSwitcher name="recipes" defaultTab="All">
            <PanelSwitcherContent title="All">
                <RecipeList source="all" />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent
                title="My Recipes"
                actions={createAction}
            >
                <RecipeList source="user" />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
