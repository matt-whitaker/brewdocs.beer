import recipes from "@brewdocs/data/recipes";
import Link from "next/link";
import Container from "@brewdocs/components/common/container";
import AppWrapper from "@brewdocs/components/app-wrapper";

export default function Home() {
    return (
        <AppWrapper>
            <Container>
                <h1 className="text-2xl">Your brews</h1>
                <ul className="mt-4">
                    {recipes.map((recipe, i) => (
                        <li className="list-disc ml-5 underline hover:font-semibold">
                            <Link href={`/recipe/${i}`}>{recipe.name} by {recipe.brewer || ""}</Link>
                        </li>
                    ))}
                </ul>
            </Container>
        </AppWrapper>
    );
}
