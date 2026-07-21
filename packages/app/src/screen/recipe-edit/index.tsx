import {ScreenH1} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import {useRecipe} from "@/state/recipes";
import {useCallback} from "react";
import RecipeEditDetails from "@/screen/recipe-edit/details";

export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);
    // There's no writable recipes store yet, so onChange is a no-op: the
    // draft only ever lives in useJsonEdit's local state and is discarded
    // on navigate. This is intentional, not an oversight.
    const onChange = useCallback(() => {}, []);
    const [data, update, updateScalar] = useJsonEdit<KbRecipe>(recipe, onChange);

    return (
        <Screen>
            <ScreenH1 className="mb-2">{data.name}</ScreenH1>
            <RecipeEditDetails recipe={data} update={update} updateScalar={updateScalar} />
        </Screen>
    )
}
