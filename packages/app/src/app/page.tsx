import AppWrapper from "@/component/app-wrapper";
import BrewList from "@/screen/brew-list";
import getRecipes from "@/service/getRecipes";

export default async function Home() {
    return (
        <AppWrapper>
            <BrewList />
        </AppWrapper>
    );
}
