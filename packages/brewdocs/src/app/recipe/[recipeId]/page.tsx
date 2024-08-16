import RecipeOverview from "@brewdocs/screen/recipe-overview";
import PrepList from "@brewdocs/screen/prep-list";
import BrewDay from "@brewdocs/screen/brew-day";
import BrewSummary from "@brewdocs/screen/brew-summary";
import AppWrapper from "@brewdocs/component/app-wrapper";
import TabArray from "@brewdocs/component/tab-array";
import PanelWrapper from "../../../component/panel-wrapper";
import getRecipes from "@brewdocs/service/getRecipes";
import Toolbar from "@brewdocs/component/toolbar";
import {ScreenH1} from "@brewdocs/component/typography";

export type RecipeProps = { params: { recipeId: number } }

export async function generateStaticParams()  {
    return (await getRecipes()).map((_, i) => ({ recipeId: `${i}` }));
}

export default async function Recipe({ params }: RecipeProps) {
    return (
        <AppWrapper className="max-h-[100vh] sm:max-h-none flex flex-col box-border">
            <Toolbar />
            <ScreenH1 className="ml-4 mb-5">BrewDocs: Brew Day!</ScreenH1>
            <TabArray tabs={["Overview", "Checklist", "Brew Day", "Summary"]} />
            <PanelWrapper>
                <RecipeOverview i={params.recipeId} />
                <PrepList i={params.recipeId} />
                <BrewDay i={params.recipeId} />
                <BrewSummary i={params.recipeId} />
            </PanelWrapper>
        </AppWrapper>
    )
}
