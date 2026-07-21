import {ScreenH1} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import {useRecipe} from "@/state/recipes";
import {useCallback} from "react";
import RecipeEditGrains from "@/screen/recipe-edit/grains";
import RecipeEditHops from "@/screen/recipe-edit/hops";
import RecipeEditYeasts from "@/screen/recipe-edit/yeasts";
import RecipeEditAdditives from "@/screen/recipe-edit/additives";

export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);
    // There's no writable recipes store yet, so onChange is a no-op: the
    // draft only ever lives in useJsonEdit's local state and is discarded
    // on navigate. This is intentional, not an oversight.
    const onChange = useCallback(() => {}, []);
    const [data, update, updateScalar, toggle, add, remove] = useJsonEdit<KbRecipe>(recipe, onChange);

    return (
        <Screen>
            <ScreenH1>{data.name}</ScreenH1>
            <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
                <div>
                    <RecipeEditGrains
                        grains={data.grains}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                    <RecipeEditHops
                        hops={data.hops}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </div>
                <div>
                    <RecipeEditYeasts
                        yeasts={data.yeasts}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                        toggle={toggle}
                    />
                    <RecipeEditAdditives
                        additives={data.additives}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </div>
            </div>
        </Screen>
    )
}
