import AppWrapper from "@brewdocs/component/app-wrapper";
import BrewList from "@brewdocs/screen/brew-list";
import getRecipes from "@brewdocs/service/getRecipes";

export default async function Home() {
    return (
        <AppWrapper>
            <BrewList />
        </AppWrapper>
    );
}
