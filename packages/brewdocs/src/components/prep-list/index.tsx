import Recipe from "@brewdocs/model/recipe";

export interface PrepListProps {
    recipe: Recipe;
}

export default function PrepList({ recipe }: PrepListProps) {
    return (
        <div>
            Prep Checklist
        </div>
    )
}