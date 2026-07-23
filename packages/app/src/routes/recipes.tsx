import {createFileRoute} from "@tanstack/react-router";
import Action from "@/component/action";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {Plus} from "@/component/svg";
import RecipeCreateModal from "@/screen/recipe-create-modal";
import RecipeList from "@/screen/recipe-list";

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
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
