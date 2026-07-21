import {createFileRoute} from "@tanstack/react-router";
import RecipeEdit from "@/screen/recipe-edit";

export const Route = createFileRoute("/recipe/$recipeId/edit")({
    component: RecipeEditPage
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();

    return <RecipeEdit recipeId={recipeId} />;
}
