import RecipeOverview from "@/screen/recipe-overview";
import PrepList from "@/screen/prep-list";
import BrewDay from "@/screen/brew-day";
import BrewSummary from "@/screen/brew-summary";
import AppWrapper from "@/component/app-wrapper";
import TabArray from "@/component/tab-array";
import PanelWrapper from "../../../component/panel-wrapper";
import getRecipes from "@/service/getRecipes";
import Toolbar from "@/component/toolbar";
import {ScreenH1} from "@/component/typography";

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
