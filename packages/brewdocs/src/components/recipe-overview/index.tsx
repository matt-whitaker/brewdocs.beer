import Recipe from "@brewdocs/model/recipe";
import SrmAvatar from "@brewdocs/components/srm-avatar";

export interface RecipeOverviewProps {
    recipe: Recipe;
}

export default function RecipeOverview({ recipe }: RecipeOverviewProps) {
    return (
        <div className="w-full h-full p-5">
            <div className="flex">
                <div className="flex-grow">
                    <h2 className="text-xl capitalize">{recipe.name}</h2>
                    <p className="text-lg capitalize">By {recipe.brewer}</p>
                    <p className="text-sm">{recipe.description}</p>
                    <div className="flex pt-3 w-full justify-evenly [&>p]:grow [&>p]:text-left">
                        <p>ABV {recipe.targets.abv}</p>
                        <p>IBU {recipe.targets.ibu}</p>
                    </div>
                </div>
                <div className="ml-5 flex justify-center">
                    <SrmAvatar srm={recipe.targets.srm} />
                </div>
            </div>
            <div className="pt-5">
                <p><b>Grain:</b> {recipe.grain.map(({ name }) => name).join(", ")}</p>
                <p><b>Hops:</b> {recipe.hops.map(({ name }) => name).join(", ")}</p>
                <p><b>Yeast:</b> {recipe.yeast.map(({ name }) => name).join(", ")}</p>
            </div>
        </div>

    );
}