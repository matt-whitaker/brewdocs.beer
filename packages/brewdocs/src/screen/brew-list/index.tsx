import Link from "next/link";
import Container from "@brewdocs/components/common/container";
import Recipe from "@brewdocs/model/recipe";

export interface BrewListProps {
    recipes: Recipe[];
}

export default function BrewList({ recipes }: BrewListProps) {
    return (
        <Container>
            <h1 className="text-2xl">Your brews</h1>
            <ul className="mt-4">
                {recipes.map((recipe, i) => (
                    <li key={recipe.id} className="list-disc ml-5 underline hover:font-semibold">
                        <Link href={`/recipe/${i}`}>{recipe.name} by {recipe.brewer || ""}</Link>
                    </li>
                ))}
            </ul>
        </Container>
    )
}