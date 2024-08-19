import TabScreens from "../../component/tab-screens";
import RecipeList from "@/screen/recipe-list";
import {useMemo} from "react";

export default function Recipes() {
    return (
        <TabScreens tabs={useMemo(() => [
            ["Recipes", RecipeList],
            ["Starred", false],
            ["My Recipes", false],
        ], [])}>
        </TabScreens>
    )
}