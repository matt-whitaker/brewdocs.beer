import Recipe from "@brewdocs/model/recipe";
import Container from "@brewdocs/components/common/container";
import Preparation from "@brewdocs/model/preparation";

export interface PrepListProps {
    recipe: Recipe;
    preparations: Preparation[];
}

export default function PrepList({ recipe, preparations }: PrepListProps) {
    return (
        <Container>
            <div className="sm:grid sm:grid-cols-4">
                {preparations.map(([title, id, items]) => (
                    <div className="mb-5">
                        <label htmlFor={id} className="text-xl">{title}</label>
                        <ul id={id}>
                            {items.map((item) => (
                                <label className="flex items-center">
                                    <input type="checkbox" className="checkbox sm:checkbox-sm checkbox-xs mr-3" />
                                    {item}
                                </label>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Container>
    )
}