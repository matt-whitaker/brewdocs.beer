import RecipeOverview from "@brewdocs/screen/recipe-overview";
import recipes from "@brewdocs/data/recipes";
import PrepList from "@brewdocs/screen/prep-list";
import preparations from "@brewdocs/data/preparations";
import BrewDay from "@brewdocs/screen/brew-day";
import BrewSummary from "@brewdocs/screen/brew-summary";
import batches from "@brewdocs/data/batches";
import AppWrapper from "@brewdocs/components/app-wrapper";
import TabArray from "@brewdocs/components/tab-array";
import TabWrapper from "@brewdocs/components/tab-wrapper";

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
            <TabWrapper>
                <RecipeOverview recipe={recipes[params.recipeId]} />
                <PrepList recipe={recipes[params.recipeId]} preparations={preparations} />
                <BrewDay recipe={recipes[params.recipeId]} />
                <BrewSummary recipe={recipes[params.recipeId]} batch={batches[params.recipeId]} />
            </TabWrapper>
        </AppWrapper>
    )
}
