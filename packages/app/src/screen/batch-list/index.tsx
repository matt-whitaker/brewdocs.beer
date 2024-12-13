"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {ScreenH1, ScreenH2, ScreenP} from "@brewdocs.beer/design";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";
import {statuses} from "@/model/status";

export default function BatchList({ batches, recipesIndex }: { batches: Batch[]; recipesIndex: Map<string, Recipe> }) {
    return (
        <Screen>
            <ScreenH1>Your brews</ScreenH1>
            <ul className="menu px-0">
                {batches.map((batch) => (
                    <li key={batch.id} className="odd:bg-base-200">
                        <Link href={`/batch?batchId=${batch.id}`} className="text-left block">
                            <ScreenH2 className="text-lg">{recipesIndex.get(batch.recipeId)?.name || ""}</ScreenH2>
                            <ScreenP>{batch.name || ""}</ScreenP>
                            <ScreenP>by {batch.brewer || recipesIndex.get(batch.recipeId)?.brewer || ""}</ScreenP>
                            <ScreenP>Status: {statuses[batch.status]}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}