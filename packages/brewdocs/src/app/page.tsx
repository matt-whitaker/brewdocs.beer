import AppWrapper from "@brewdocs/components/app-wrapper";
import BrewList from "@brewdocs/screen/brew-list";
import recipes from "@brewdocs/data/recipes";

export default function Home() {
    return (
        <AppWrapper>
            <BrewList recipes={recipes} />
        </AppWrapper>
    );
}
