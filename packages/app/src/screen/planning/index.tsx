"use client";

import {ScreenH1, ScreenH2, ScreenH3, ScreenP, InputDate} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";

import useJsonEdit from "@/hooks/useJsonEdit";
import ScreenTwoCol from "@/component/screen/two-col";
import Screen from "@/component/screen";
import {useKbHops} from "@/state/kbHops";
import {useKbYeasts} from "@/state/kbYeasts";
import {useKbGrains} from "@/state/kbGrains";
import useIndexBy from "@/hooks/useIndexBy";
import PlanningHops from "@/screen/planning/hops";
import PlanningYeast from "@/screen/planning/yeast";
import PlanningGrains from "@/screen/planning/grains";
import {useSession} from "@/state/session";

export type PlanningProps = {
    batch: Batch;
    recipe: Recipe;
    onChange: (batch: Batch) => void
}
export default function Planning({ batch, recipe, onChange }: PlanningProps) {
    const session = useSession();

    const [data, update, updateScalar,, add, remove] = useJsonEdit<Batch>(batch, onChange);

    return (
        <>
            <Screen>
                <ScreenH1 className="mb-2">Batch Planning</ScreenH1>
                <div className="lg:max-w-[80%] lg:pb-4 relative">
                    <ScreenH2 className="first-of-type:mt-0">{recipe.name}</ScreenH2>
                    <ScreenH3>{batch.name || ""}</ScreenH3>
                    <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                    <ScreenP>
                        Brewed on:
                        <InputDate
                            className="ml-1"
                            primary
                            align="right"
                            onChange={(value: string) => update(`brewDate`, value)}
                            value={data.brewDate} />
                    </ScreenP>
                </div>
            </Screen>
            <ScreenTwoCol>
                <div>
                    <PlanningGrains
                        grains={data.grains}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                        session={session}
                    />
                    <PlanningHops
                        hops={data.hops}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                        session={session}
                    />
                </div>
                <div>
                    <PlanningYeast
                        yeast={data.yeast}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                        session={session}
                    />
                </div>
            </ScreenTwoCol>
        </>
    )
}
