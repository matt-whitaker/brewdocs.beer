import {Link} from "@tanstack/react-router";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb";
import ConfirmDeleteButton from "@/component/confirm-delete-button";
import Recipe, {RecipeSource} from "@/model/recipe";


export type RecipeListItemProps = {
    recipe: KbRecipe | Recipe;
    source: RecipeSource;
    onDelete?: () => void;
};

export default function RecipeListItem({ recipe, source, onDelete }: RecipeListItemProps) {
    const to = source === "kb" ? "/kb/recipe/$recipeId" : "/recipe/$recipeId";
    return (
        <li className="odd:bg-base-200 relative">
            <Link to={to} params={{recipeId: recipe.id}} className="text-left block">
                <ScreenH2 className="text-lg">{recipe.name}</ScreenH2>
                <ScreenP className="mb-1">by {recipe.brewer}</ScreenP>
                <ScreenP>ABV {recipe.targets.abv.value} | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og.value} | F.G. {recipe.targets.fg.value}</ScreenP>
                <ScreenP className="pt-2">{recipe.description}</ScreenP>
            </Link>
            {onDelete && <ConfirmDeleteButton label={`Delete ${recipe.name}`} title={`Delete ${recipe.name}?`} onConfirm={onDelete} />}
        </li>
    );
}

export function RecipeListItemFallback() {
    return (
        <li className="odd:bg-base-200 relative">
            <ScreenP>This recipe can&rsquo;t be displayed.</ScreenP>
        </li>
    );
}