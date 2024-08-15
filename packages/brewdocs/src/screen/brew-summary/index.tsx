import Recipe from "@brewdocs/model/recipe";
import {Batch} from "@brewdocs/model/batch";
import ScreenContainer from "../../components/screen-container";
import Vitals from "@brewdocs/model/vitals";

export interface BrewSummaryProps {
    recipe: Recipe;
    batch: Batch;
}

export default function BrewSummary({ recipe, batch }: BrewSummaryProps) {
    const vitalsData: [string, Vitals][] = [["Target", recipe.targets], ["Actuals", batch.actuals]];
    return (
        <ScreenContainer>
            <div className="[&>h4]:mt-2.5 [&>h4]:capitalize [&>h4]:text-lg [&>h4]:font-semibold">
                <div className="sm:hidden">
                    <h2 className="text-xl capitalize">{recipe.name}</h2>
                    <h3 className="text-lg capitalize">By {recipe.brewer}</h3>
                    <p className="mt-1"><b>Brewed on</b> {batch.brewDate.toDateString()}</p>
                    <p className="mt-0.5">{recipe.description}</p>
                </div>
                <h4>Vitals</h4>
                <div className="flex w-full justify-evenly [&>div]:grow [&>div>*]:text-left">
                    {vitalsData.map(([name, vitals]) => (
                        <div key={name}>
                            <h4>{name}</h4>
                            <p>ABV {vitals.abv}</p>
                            <p>IBU {vitals.ibu}</p>
                            <p>SRM {vitals.srm}</p>
                            <p>O.G. {vitals.og}</p>
                            <p>F.G. {vitals.fg}</p>
                        </div>
                    ))}
                </div>
                <h4>Hops</h4>
                <p>{batch.hops.map(({ name }) => name).join(", ")}</p>
                <h4>Grain</h4>
                <p>{batch.grain.map(({ name }) => name).join(", ")}</p>
                <h4>Yeast</h4>
                <p>{batch.yeast.map(({ name }) => name).join(", ")}</p>
            </div>
        </ScreenContainer>
    )
}
