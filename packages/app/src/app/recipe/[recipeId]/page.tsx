import PrepList from "@/screen/prep-list";
import BrewSummary from "@/screen/brew-summary";
import getRecipes from "@/service/getRecipes";
import TabWrapper from "@/component/tab-wrapper";
import BrewDay from "@/screen/brew-day";
import Shell from "@/component/shell";

export type RecipeProps = { params: { recipeId: number } }

export async function generateStaticParams()  {
    return (await getRecipes()).map((_, i) => ({ recipeId: `${i}` }));
}

export default async function Recipe({ params }: RecipeProps) {
    return (
        <Shell>
            <TabWrapper tabs={[
                ["Checklist", <PrepList i={params.recipeId} />],
                ["Brew Day", <BrewDay i={params.recipeId} />],
                ["Ferment", <p></p>],
                ["Summary", <BrewSummary i={params.recipeId} />]
            ]}>
            </TabWrapper>
        </Shell>
    )
}
