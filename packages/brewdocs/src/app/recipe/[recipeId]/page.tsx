import RecipeOverview from "@brewdocs/screen/recipe-overview";
import recipes from "@brewdocs/data/recipes";
import PrepList from "@brewdocs/screen/prep-list";
import preparations from "@brewdocs/data/preparations";
import BrewDay from "@brewdocs/screen/brew-day";
import BrewSummary from "@brewdocs/screen/brew-summary";
import batches from "@brewdocs/data/batches";
import AppWrapper from "@brewdocs/components/app-wrapper";
import TabArray from "@brewdocs/components/tab-array";

export interface RecipeProps {
    params: {
        recipeId: number
    }
}

export function generateStaticParams()  {
    return recipes.map((_, i) => ({ recipeId: `${i}` }));
}

export default function Recipe({ params }: RecipeProps) {
    return (
        <AppWrapper>
            <TabArray tabs={["Overview", "Checklist", "Brew Day", "Summary"]} />
            <div className="peer-has-[#tab-1:checked]/array:block sm:block hidden">
                <RecipeOverview recipe={recipes[params.recipeId]} />
            </div>
            <hr className="sm:block hidden "/>
            <div className="peer-has-[#tab-2:checked]/array:block sm:block hidden">
                <PrepList recipe={recipes[params.recipeId]} preparations={preparations} />
            </div>
            <hr className="sm:block hidden "/>
            <div className="peer-has-[#tab-3:checked]/array:block sm:block hidden">
                <BrewDay recipe={recipes[params.recipeId]} />
            </div>
            <hr className="sm:block hidden "/>
            <div className="peer-has-[#tab-4:checked]/array:block sm:block hidden">
                <BrewSummary recipe={recipes[params.recipeId]} batch={batches[params.recipeId]} />
            </div>
        </AppWrapper>
    )
}
