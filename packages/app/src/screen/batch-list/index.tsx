"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {ScreenH2, ScreenH3, ScreenP} from "@/component/typography";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";

export default function BatchList({ batches, recipes }: { batches: Batch[]; recipes: Map<string, Recipe> }) {
    return (
        <Screen>
            <ScreenH2 className="mt-0">Your brews</ScreenH2>
            <ul className="menu mt-4 px-0">
                {batches.map((batch, i) => (
                    <li key={i} className="odd:bg-base-200">
                        <Link href={`/batch?batchId=${batch.id}`} className="text-left block">
                            <ScreenH2 className="text-xl">{recipes.get(batch.recipeId)?.name || ""}<br />{batch.name || ""}</ScreenH2>
                            <ScreenH3 className="text-lg mb-1">by {batch.brewer || recipes.get(batch.recipeId)?.brewer || ""}</ScreenH3>
                            <ScreenP>Status: {batch.status}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}